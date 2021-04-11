ifneq (,$(wildcard ./.env))
    include .env
    export
    ENV_FILE_PARAM = --env-file .env
endif

CURRENT_DIR = $(notdir $(shell pwd))
PROJECT = $(shell echo $(CURRENT_DIR) | tr A-Z a-z)

compose_build:
	COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose -f docker-compose.yml build

compose_deploy:
	COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose -f docker-compose.yml up -d

compose_clean:
	docker-compose -f docker-compose.yaml down

docker_tag:
	docker tag $(PROJECT)_$(APP) $(DH_USER)/$(APP):"${VERSION}"

docker_push:
	docker push $(DH_USER)/$(APP):"${VERSION}"

k8s_deploy:
	kubectl apply -f k8s

k8s_clean:
	kubectl delete -f k8s
