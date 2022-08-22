ENV = env GOOGLE_APPLICATION_CREDENTIALS=$(PWD)/secrets/service-account-file.json

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
	curl https://raw.communitydragon.org/latest/cdragon/tft/en_us.json > src/data/en_us.json
