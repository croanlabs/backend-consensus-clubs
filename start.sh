docker build --no-cache -t consensusclubs/api-consensus-clubs:v1.0.0 app/
kubectl create -f eos.yaml
kubectl create -f node.yaml
