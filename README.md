# niilearn
Nodejs Machine Learning REST API

post csv:
```
curl --data-binary "@data.csv" http://localhost:8080/api/v1/bayes/train-csv/data?label=fieldName&text=fieldName
```

```
curl -H "Content-Type: application/json" -X POST -d '{"valid": "json"}' http://localhost:8080/api/v1/bayes/classify/data
```
