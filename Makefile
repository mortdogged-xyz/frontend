ENV = env GOOGLE_APPLICATION_CREDENTIALS=$(PWD)/secrets/service-account-file.json

export-feedback:
	$(ENV) gcloud firestore export gs://feedback/meta
