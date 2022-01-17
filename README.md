
## Description

This repository in an assignment for applying Software Apegineer Role.
Implemented by [NodeJS](https://nodejs.org/en/), [NestJS](https://nestjs.com/) and [EthersJS](https://docs.ethers.io/v5/).

I also use [ethers-multicall](https://github.com/cavanmflynn/ethers-multicall) to improve the performance on some contract callings.

## Prerequisites
```
Docker
Docker-compose
```

## Running the app

Please make sure that the expose ports are not used on your localhostใ
```bash
$ docker-compose up
```

## APIs
Default port is :3000
- GET / : Hello World!
- GET /autofarm/cache : Return Current Cached Autofarm's Pools
- GET /autofarm/cache/update: Update Autofarm's pool information
- GET /autofarm/{address}: Return address's staked tokens and information

## Known Issue
- There are some error during update the pool details which cause data lost.

![image](https://user-images.githubusercontent.com/47054457/149803430-d9d25a66-87e5-4519-b9bf-6b0d3179cada.png)
