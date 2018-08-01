docker build --no-cache -t consensusclubs/api-consensus-clubs:v1.0.0 api/
docker build --no-cache -t consensusclubs/eos-dev:v1.0.0 eos/
kubectl create -f api-secrets.yaml
kubectl create -f eos-secrets.yaml
kubectl create -f eos.yaml
kubectl create -f postgres.yaml
sleep 15
kubectl create -f node.yaml
