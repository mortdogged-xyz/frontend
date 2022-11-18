ENV = env GOOGLE_APPLICATION_CREDENTIALS=$(PWD)/secrets/service-account-file.json
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

update-dragon-data:
	$(CURL) https://raw.communitydragon.org/latest/cdragon/tft/en_us.json > src/data/en_us.json
	$(CURL) https://raw.communitydragon.org/latest/content-metadata.json > src/data/content-metadata.json

update-dragon-data-pbe:
	$(CURL) https://raw.communitydragon.org/pbe/cdragon/tft/en_us.json > src/data/en_us.json
	$(CURL) https://raw.communitydragon.org/pbe/content-metadata.json > src/data/content-metadata.json
