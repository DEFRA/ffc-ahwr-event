# FFC AHWR event
FFC AHWR event to process events from the vet visits back office service.

This [Azure Function app](https://azure.microsoft.com/en-gb/services/functions/) is triggered from a service bus message requesting an event message.

## Prerequisites

- Node.js 16+
- access to an Azure blob storage account (see options below)
- [Azure Functions Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=v4%2Clinux%2Ccsharp%2Cportal%2Cbash)
- Configure `.local.settings.json` to include live connection strings and keys for service as required
- Rename `.local.settings.json` to `local.settings.json`

## Example message

```
{
  name: 'Test event',
  properties: {
    id: 'awhr-1234-567',
    checkpoint: 'ffc-ahwr-application',
    status : 'success',
    action: {
      type: 'change',
      message: 'editing',
      data: {
        state: { 
          original: { name: 'test data 1' },
          new: { name: 'test data 2' }
        }
      }.
      raisedOn: '2022-06-14T18:25:43-05:00',
      raisedBy: 'Testy McTestyson'
    }
  }
}
```

## Azure Storage

To support local development of Azure blob storage, there are several options:

1. Use the Docker Compose file in this repository (recommended).

Running the below command will run an Azurite container.

`docker-compose up -d`

2. Install Azurite locally

See [Microsoft's guide](https://docs.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=visual-studio) for information.

3. Use Azure cloud hosted storage

If any option other than `1` is taken, then the connection strings in `local.settings.json` will need to be updated.

## Configuration

The `local.settings.json` is required to hold all local development environment values. As this file contains sensitive values, it is excluded from source control. The `.local.settings.json` file is a template for this and needs amended to include valid information. 

Example:

For blob, examples assumes option `1` is taken above and therefore shows connection strings for local Azurite container.

It's likely that the Service Bus topic and subscription names will need to be amended to match those owned by the developer.

```

{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10001/devstoreaccount1;QueueEndpoint=http://127.0.0.1:10002/devstoreaccount1;",
    "ServiceBusConnectionString": "",
    "TableConnectionString": "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;TableEndpoint=http://127.0.0.1:10003/devstoreaccount1",
    "AZURE_STORAGE_USE_CONNECTION_STRING": "true",
    "AZURE_STORAGE_ACCOUNT_NAME": "devstoreaccount1",
    "AZURE_STORAGE_TABLE": "ahwreventstore",
    "AHWR_EVENT_TOPIC": "ffc-ahwr-event",
    "AHWR_EVENT_SUBSCRIPTION": "ffc-ahwr-event",
    "AHWR_EVENT_PROJECTION_TOPIC": "ffc-ahwr-event-projection"
  }
}

```

## Running the application

Use the convenience script, `./scripts/start`

### Running tests

```
# Run all tests
./scripts/test

# Run tests with file watch
./scripts/test -w
```

## Function Development

The best place to start for an overall view of how JavaScript Functions work in
Azure is the
[Azure Functions JavaScript developer guide](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node?tabs=v2).
From there follow the appropriate link to the documentation specific to
your preferred development environment i.e.
[Visual Studio Code](https://docs.microsoft.com/en-us/azure/azure-functions/create-first-function-vs-code-node)
or
[command line](https://docs.microsoft.com/en-us/azure/azure-functions/create-first-function-cli-node?tabs=azure-cli%2Cbrowser).

The documentation within this repo assumes the `command line` setup has been
completed, specifically for
[Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli).


## CI pipeline

This service uses the [FFC CI pipeline](https://github.com/DEFRA/ffc-jenkins-pipeline-library)

## License

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT
LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and
applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.