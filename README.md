# Backend of the Consensus Clubs project.
## Dependencies
Install the following dependencies before running the project:
 - Docker
 - Minikube
 - Kubectl

Run the following command to allow Minikube to work with the Docker deamon:
```bash
eval $(minikube docker-env)
```

## Usage
### Running the project
Run the start script to execute the project locally:
```bash
./start.sh development
```

### Clean restart
Run the restart script to delete the Kubernetes pods, services and deployments, re-build the nodejs-based Docker image to include your code and create the aforementioned Kubernetes entities again:
```bash
./restart.sh development
```

### Clean
Run the clean script to delete all the Kubernetes entities created by this program:
```bash
./clean.sh
```

### Verify results
The status of the created Kubernetes entities (including logs) can be checked through the minikube dashboard: 
```bash
minikube dashboard
```
