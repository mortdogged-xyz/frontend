ENV = env GOOGLE_APPLICATION_CREDENTIALS=$(PWD)/secrets/service-account-file.json

run:
	npm run start

export-feedback:
	$(ENV) gcloud firestore export gs://feedback/meta

lint-format:
	npm run lint:format
