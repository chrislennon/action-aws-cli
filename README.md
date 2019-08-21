<p align="center">
  <a href="https://github.com/chrislennon/action-aws-cli"><img alt="GitHub Actions status" src="https://github.com/chrislennon/action-aws-cli/workflows/master%20builds/badge.svg"></a>
</p>

# action-aws-cli

Action to install AWS cli

## Usage

Example
````yaml
name: Example

on:
  push

jobs:
  listS3:
    runs-on: ubuntu-latest
    steps:
      - uses: chrislennon/action-aws-cli@v1
      - run: aws s3 ls
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
````
