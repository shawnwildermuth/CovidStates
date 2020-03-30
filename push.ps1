Set-Location ./src
npm run build
Set-Location ..
docker build . -t covidstates:latest
docker tag covidstates:latest shawnwildermuth/covidstates:latest
docker push shawnwildermuth/covidstates:latest