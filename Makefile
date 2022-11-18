ENV = env GOOGLE_APPLICATION_CREDENTIALS=$(PWD)/secrets/service-account-file.json
DATA_VERSION = latest
CURL = curl -s

.PHONY: build
build:
	npm run build

run:
	npm run start

export-feedback:
	$(ENV) gcloud firestore export gs://feedback/meta

lint:
	npm run lint

lint-fix:
	npm run lint:fix

_update-dragon-data:
	$(CURL) https://raw.communitydragon.org/$(DATA_VERSION)/cdragon/tft/en_us.json > src/data/en_us.json
	$(CURL) https://raw.communitydragon.org/$(DATA_VERSION)/content-metadata.json > src/data/content-metadata.json

update-dragon-data:
	$(MAKE) _update-dragon-data DATA_VERSION=latest

update-dragon-data-pbe:
	$(MAKE) _update-dragon-data DATA_VERSION=pbe
