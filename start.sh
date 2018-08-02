docker build --no-cache -t consensusclubs/api-consensus-clubs:v1.0.0 api/
docker build --no-cache -t consensusclubs/eos-dev:v1.0.0 eos/
kubectl create -f config/api-secrets.yaml
kubectl create -f config/eos-secrets.yaml
kubectl create -f config/eos.yaml
kubectl create -f config/eos-tests.yaml
kubectl create -f config/postgres.yaml
kubectl create -f config/postgres-tests.yaml
sleep 15
kubectl create -f config/node.yaml
