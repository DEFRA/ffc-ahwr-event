# FFC AHWR event

FFC AHWR event to process events from the vet visits back office service.

This [Azure Function app](https://azure.microsoft.com/en-gb/services/functions/) is triggered from a service bus message requesting an event message.

## Prerequisites

- Node.js 16+
- access to an Azure blob storage account (see options below)
- [Azure Functions Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=v4%2Clinux%2Ccsharp%2Cportal%2Cbash)
- Configure `.local.settings.json` to include live connection strings and keys for service as required
- Rename `.local.settings.json` to `local.settings.json`

### pre-commit

Please install [pre-commit](https://pre-commit.com/), as it is used to scan commits for secrets using [Gitleaks](https://github.com/gitleaks/gitleaks).

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

## Service Bus

This function is triggered by a Service Bus queue message. To support local development, there are several options:

1. Use the [Azure Service Bus Emulator](https://learn.microsoft.com/en-us/azure/service-bus-messaging/overview-emulator) via the Docker Compose file in this repository (recommended).

Running `docker compose up -d` also starts a SQL Edge container (used by the emulator to store its metadata) and the emulator itself, pre-configured via `servicebus-emulator-config.json` with a `ffc-ahwr-event` queue matching `AHWR_EVENT_QUEUE` below.

> On Apple Silicon Macs, SQL Edge runs under x86 emulation and can occasionally crash on startup. Both containers are configured with `restart: on-failure`, so Docker retries automatically — give it a few seconds if the emulator doesn't come up straight away.

2. Use Azure cloud hosted Service Bus

Point `ServiceBusConnectionString` and `AHWR_EVENT_QUEUE` in `local.settings.json` at a real namespace and queue instead.

### Sending a test event

With the containers running (`docker compose up -d`) and the function started (`./scripts/start`), publish a message onto the local queue with:

```
./scripts/send-test-event
```

This sends an example `send-session-event` payload and prints what it sent — watch the function's own logs to see it get picked up and processed. Pass a different event name as an argument to exercise other cases (the rest of the payload stays the same):

```
./scripts/send-test-event send-ineligibility-event
```

## Configuration

The `local.settings.json` is required to hold all local development environment values. As this file contains sensitive values, it is excluded from source control. The `.local.settings.json` file is a template for this and needs amended to include valid information.

Example:

The example below assumes options `1` is taken for both storage and Service Bus above, and therefore shows connection strings for the local Azurite container and Service Bus Emulator. The ports match this repository's `docker-compose.yaml`.

```

{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10020/devstoreaccount1;QueueEndpoint=http://127.0.0.1:10021/devstoreaccount1;TableEndpoint=http://127.0.0.1:10022/devstoreaccount1;",
    "ServiceBusConnectionString": "Endpoint=sb://localhost;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=SAS_KEY_VALUE;UseDevelopmentEmulator=true;",
    "TableConnectionString": "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;TableEndpoint=http://127.0.0.1:10022/devstoreaccount1",
    "AZURE_STORAGE_USE_CONNECTION_STRING": "true",
    "AZURE_STORAGE_ACCOUNT_NAME": "devstoreaccount1",
    "AZURE_STORAGE_TABLE": "ahwreventstore",
    "AHWR_EVENT_QUEUE": "ffc-ahwr-event"
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

This service previously used the Jenkins pipeline. Deployments are done with the existing Azure pipeline.

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
