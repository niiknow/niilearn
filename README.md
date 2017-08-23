# niilearn
Nodejs Machine Learning REST API

post csv:
```
curl --data-binary "@data.csv" http://localhost:8080/api/v1/bayes/train-csv/modelName?label=fieldName&text=fieldName
```

classify:
```
curl -H "Content-Type: application/json" -X POST -d '{"valid": "json"}' http://localhost:8080/api/v1/bayes/classify/modelName
```

# API

## POST /api/v1/bayes/train/:modelName
post a JSON with array of dataset and labels

```
{
    "dataset": ["string1", "string2" ... "stringn"],
    "labels": [cat1, cat2, ... catn]
}
```

## POST /api/v1/bayes/train-csv/:modelName?label=fieldName&text=fieldName
post as CSV

* CSV must have a header
* header is either text/label or defined in query string

## POST /api/v1/bayes/reset/:modelName
clear the data

## POST /api/v1/bayes/classify/:modelName
pass in 'dataset' array to bulk classify or a single item to classify only one.  Results are mapped to input 'dataset' array index.

```
{
    "dataset": ["sometext"]
}

// returns
{
    result: []
}
```
