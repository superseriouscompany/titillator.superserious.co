#!/bin/bash
#
# henoku sets up a heroku-like deploy environment for nodejs
#
#
HOST=${HOST:-api.linkedup.co}
REPO_NAME=${REPO_NAME:-api.linkedup.co}
RUN_COMMAND=${RUN_COMMAND:-/usr/bin/npm start}
ROOT=${ROOT:-ubuntu}
ROOT_HOME=${ROOT_HOME:-/home/ubuntu}
LETSENCRYPT_EMAIL=superseriousneil@gmail.com
username="$(whoami)"

# TODO: use digitalocean/aws api and cloudflare api to create the host
# gcloud compute --project "super-serious-company" instances create "titillator-production" --zone "europe-west1-c" --machine-type "f1-micro" --subnet "default" --maintenance-policy "MIGRATE" --service-account "549749290464-compute@developer.gserviceaccount.com" --scopes "https://www.googleapis.com/auth/devstorage.read_only","https://www.googleapis.com/auth/logging.write","https://www.googleapis.com/auth/monitoring.write","https://www.googleapis.com/auth/servicecontrol","https://www.googleapis.com/auth/service.management.readonly","https://www.googleapis.com/auth/trace.append" --tags "http-server","https-server" --image "ubuntu-1604-xenial-v20170330" --image-project "ubuntu-os-cloud" --boot-disk-size "10" --boot-disk-type "pd-standard" --boot-disk-device-name "titillator-production"
# gcloud compute --project "super-serious-company" firewall-rules create "default-allow-http" --allow tcp:80 --network "default" --source-ranges "0.0.0.0/0" --target-tags "http-server"
# gcloud compute --project "super-serious-company" firewall-rules create "default-allow-https" --allow tcp:443 --network "default" --source-ranges "0.0.0.0/0" --target-tags "https-server"

# wait for server to be up
# curl -X POST "https://api.cloudflare.com/client/v4/zones/023e105f4ecef8ad9ca31a8372d0c353/dns_records" \
#      -H "X-Auth-Email: user@example.com" \
#      -H "X-Auth-Key: c2547eb745079dac9320b638f5e225cf483cc5cfdda41" \
#      -H "Content-Type: application/json" \
#      --data '{"type":"A","name":"example.com","content":"127.0.0.1","ttl":120,"proxied":false}'

# Setup server
echo "Updating apt-get..."
ssh "$ROOT"@"$HOST" sudo apt-get update -y
ssh "$ROOT"@"$HOST" sudo apt-get upgrade -y

# Create user to ssh in with from this computer
echo "Creating ssh user ${username}..."
ssh "$ROOT"@"$HOST" sudo useradd -s /bin/bash "$username"
ssh "$ROOT"@"$HOST" sudo mkdir /home/"$username"
ssh "$ROOT"@"$HOST" sudo mkdir /home/"$username"/.ssh
ssh "$ROOT"@"$HOST" sudo chmod 700 /home/"$username"/.ssh
ssh "$ROOT"@"$HOST" sudo cp "$ROOT_HOME"/.ssh/authorized_keys /home/"$username"/.ssh/authorized_keys
ssh "$ROOT"@"$HOST" sudo chown "$username":"$username" -R /home/"$username"
ssh "$ROOT"@"$HOST" sudo usermod -aG sudo neilsarkar
# TODO: make this passwordless
echo "echo \"$username:nope\" | sudo chpasswd" | ssh "$ROOT"@"$HOST"

# Setup firewall
echo "Setting up firewall..."
ssh "$ROOT"@"$HOST" sudo ufw allow 22
ssh "$ROOT"@"$HOST" sudo ufw allow 80
ssh "$ROOT"@"$HOST" sudo ufw allow 443
ssh "$ROOT"@"$HOST" sudo ufw disable
ssh "$ROOT"@"$HOST" sudo ufw enable -y

# Install nodejs
echo "Installing nodejs..."
ssh "$ROOT"@"$HOST" sudo apt-get install -y nodejs
ssh "$ROOT"@"$HOST" sudo apt-get install -y npm
ssh "$ROOT"@"$HOST" sudo ln -s /usr/bin/nodejs /usr/bin/node

# Install nginx
echo "Installing nginx..."
ssh "$ROOT"@"$HOST" sudo apt-get install -y nginx

# Setup letsencrypt
echo "Setting up letsencrypt..."
ssh "$ROOT"@"$HOST" sudo apt-get install -y letsencrypt
ssh "$ROOT"@"$HOST" sudo letsencrypt certonly -a webroot --webroot-path=/var/www/html -d $HOST --agree-tos --email $LETSENCRYPT_EMAIL
# ssh "$ROOT"@"$HOST" sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
# TODO: enable this thing?

# Update nginx to use ssl
echo "Updating nginx to use letsencrypt..."
echo "ssl_certificate /etc/letsencrypt/live/$HOST/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/$HOST/privkey.pem;" | ssh "$ROOT"@"$HOST" "sudo tee /etc/nginx/snippets/ssl-$HOST.conf > /dev/null"

echo '# from https://cipherli.st/
# and https://raymii.org/s/tutorials/Strong_SSL_Security_On_nginx.html

ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
ssl_prefer_server_ciphers on;
ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH";
ssl_ecdh_curve secp384r1;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
# Disable preloading HSTS for now.  You can use the commented out header line that includes
# the "preload" directive if you understand the implications.
#add_header Strict-Transport-Security "max-age=63072000; includeSubdomains; preload";
add_header Strict-Transport-Security "max-age=63072000; includeSubdomains";
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
' | ssh "$ROOT"@"$HOST" "sudo tee /etc/nginx/snippets/ssl-params.conf > /dev/null"
# TODO: readd this to above ssl_dhparam /etc/ssl/certs/dhparam.pem;
echo "server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name $HOST;
    return 301 https://\$server_name\$request_uri;
}
server {
    listen 443 ssl http2 default_server;
    listen [::]:443 ssl http2 default_server;
    include snippets/ssl-$HOST.conf;
    include snippets/ssl-params.conf;

    root /var/www/html;

    index index.html index.htm index.nginx-debian.html;

    server_name _;

    location / {
            proxy_pass http://localhost:3000;
    }

    location ~ /.well-known {
            allow all;
    }
}" | ssh "$ROOT"@"$HOST" "sudo tee /etc/nginx/sites-available/default >/dev/null"
ssh "$ROOT"@"$HOST" sudo systemctl restart nginx

# Setup git
echo "Setting up git..."
ssh "$ROOT"@"$HOST" sudo useradd -m -s /usr/bin/git-shell git
ssh "$ROOT"@"$HOST" sudo mkdir -p /home/git/.ssh
ssh "$ROOT"@"$HOST" sudo chown -R git:git /home/git/.ssh
ssh "$ROOT"@"$HOST" sudo mkdir -p /opt/src/"$REPO_NAME"
ssh "$ROOT"@"$HOST" sudo chown -R git:git /opt/src
ssh "$ROOT"@"$HOST" sudo mkdir -p /"$REPO_NAME".git
ssh "$ROOT"@"$HOST" sudo git init --bare /"$REPO_NAME".git
ssh "$ROOT"@"$HOST" sudo chown -R git:git /"$REPO_NAME".git
echo "git ALL=NOPASSWD: /bin/systemctl restart app.service, /bin/systemctl status app.service" | ssh "$ROOT"@"$HOST" "sudo tee /etc/sudoers.d/git >/dev/null"
ssh "$ROOT"@"$HOST" sudo chmod 0440 /etc/sudoers.d/git
cat ~/.ssh/id_rsa.pub | ssh "$ROOT"@"$HOST" "sudo tee /home/git/.ssh/authorized_keys >/dev/null"
echo "#!/bin/sh
git --work-tree=/opt/src/${REPO_NAME} --git-dir=/${REPO_NAME}.git checkout -f
(cd /opt/src/$REPO_NAME && NODE_ENV=production npm install)
sudo /bin/systemctl restart app.service
sudo /bin/systemctl status app.service" | ssh "$ROOT"@"$HOST" "sudo tee /${REPO_NAME}.git/hooks/post-receive >/dev/null"
ssh "$ROOT"@"$HOST" sudo "chmod +x /${REPO_NAME}.git/hooks/post-receive"

# Setup app service
echo "Setting up app service..."
echo "[Unit]
Description=${REPO_NAME} nodejs app

[Service]
Environment=NODE_ENV=production
WorkingDirectory=/opt/src/${REPO_NAME}
ExecStart=${RUN_COMMAND}
Restart=always

[Install]
WantedBy=multi-user.target" | ssh "$ROOT"@"$HOST" "sudo tee /etc/systemd/system/app.service >/dev/null"

ssh "$ROOT"@"$HOST" sudo systemctl enable app

git remote add gcloud "ssh://git@$HOST:/${REPO_NAME}.git"

echo "To deploy: "
echo "git push gcloud master"
