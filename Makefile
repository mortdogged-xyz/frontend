ENV = env GOOGLE_APPLICATION_CREDENTIALS=$(PWD)/secrets/service-account-file.json

run:
	npm run start

export-feedback:
	$(ENV) gcloud firestore export gs://feedback/meta

lint: lint-format lint-ts

lint-format:
	npm run lint:format

lint-ts:
	npm run lint:ts
