kubectl delete deployment nodejs-deployment
kubectl delete service eos-master
kubectl delete deployment eos-deployment
kubectl delete service eos-tests
kubectl delete deployment eos-tests-deployment
kubectl delete service postgres-master
kubectl delete deployment postgres-deployment
kubectl delete service postgres-tests
kubectl delete deployment postgres-tests-deployment
kubectl delete configmap kube-dns --namespace=kube-system
kubectl delete secret api-secrets
kubectl delete secret api-secrets-environment
kubectl delete secret eos-secrets
