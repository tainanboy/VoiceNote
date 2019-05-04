gcloud config set project voicenote

gcloud config set compute/zone us-east1-b

docker build -t gcr.io/voicenote/webapp:latest .

gcloud docker -- push gcr.io/voicenote/webapp

gcloud container clusters create webapp --num-nodes=1

gcloud container clusters get-credentials webapp

kubectl run webapp \
--image gcr.io/voicenote/webapp:latest \
--port 3000

kubectl expose deployment webapp --type "LoadBalancer"

kubectl get service webapp

# continue if you need https connection
kubectl apply -f basic-ingress.yaml

kubectl get ingress basic-ingress

# configure static website: https://cloud.google.com/kubernetes-engine/docs/tutorials/http-balancer