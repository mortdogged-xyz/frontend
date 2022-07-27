ENV = env GOOGLE_APPLICATION_CREDENTIALS=$(PWD)/secrets/service-account-file.json

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
