# B1tpool

<br>

B1tpool is the fully-featured mempool visualizer, explorer, and API service for the B1t blockchain.

It is an open-source project developed for the B1t community, providing comprehensive blockchain exploration and transaction analysis capabilities for the B1t network.

# Installation Methods

B1tpool can be self-hosted on a wide variety of your own hardware, ranging from a simple installation on a full-node setup all the way to a robust production instance on a powerful server.

**Most people should use the Docker installation method.** Other install methods are meant for developers and others with experience managing servers.

## Docker Installation

The easiest way to run B1tpool is using Docker:

```bash
# Clone the repository
git clone https://github.com/OnlyPW/B1tpool.git
cd B1tpool

# Copy and configure the sample config
cp backend/mempool-config.sample.json backend/mempool-config.json
# Edit the config file with your B1t Core node credentials
nano backend/mempool-config.json

# Start with Docker
docker-compose up -d
```
