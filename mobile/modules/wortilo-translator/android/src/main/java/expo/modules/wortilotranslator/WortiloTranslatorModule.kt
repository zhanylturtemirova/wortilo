package expo.modules.wortilotranslator

import com.google.mlkit.common.model.RemoteModelManager
import com.google.mlkit.nl.translate.TranslateRemoteModel
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import com.google.mlkit.common.model.DownloadConditions
import com.google.mlkit.nl.translate.Translation
import com.google.mlkit.nl.translate.TranslatorOptions

class WortiloTranslatorModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("WortiloTranslator")
    AsyncFunction("getDownloadedLanguages") { promise: Promise ->
  RemoteModelManager.getInstance()
    .getDownloadedModels(TranslateRemoteModel::class.java)
    .addOnSuccessListener { models ->
      val languages = models.map { model -> model.language }
      promise.resolve(languages)
    }
    .addOnFailureListener { error ->
      promise.reject(
        "MODEL_LIST_ERROR",
        "Could not read downloaded language models",
        error
      )
    }
}

AsyncFunction("downloadLanguage") {
    language: String, promise: Promise ->

  if (language !in listOf("en", "de", "ru")) {
    promise.reject(
      "UNSUPPORTED_LANGUAGE",
      "Supported languages: en, de, ru",
      null
    )
    return@AsyncFunction
  }

  val model = TranslateRemoteModel.Builder(language).build()
  val conditions = DownloadConditions.Builder()
    .requireWifi()
    .build()

  RemoteModelManager.getInstance()
    .download(model, conditions)
    .addOnSuccessListener {
      promise.resolve(null)
    }
    .addOnFailureListener { error ->
      promise.reject(
        "MODEL_DOWNLOAD_ERROR",
        "Could not download language model",
        error
      )
    }
}
AsyncFunction("translate") {
    text: String,
    sourceLanguage: String,
    targetLanguage: String,
    promise: Promise ->

  val supported = listOf("en", "de", "ru")

  if (sourceLanguage !in supported || targetLanguage !in supported) {
    promise.reject("UNSUPPORTED_LANGUAGE", "Supported: en, de, ru", null)
    return@AsyncFunction
  }

  if (text.isBlank() || sourceLanguage == targetLanguage) {
    promise.resolve(text)
    return@AsyncFunction
  }

  val options = TranslatorOptions.Builder()
    .setSourceLanguage(sourceLanguage)
    .setTargetLanguage(targetLanguage)
    .build()

  val translator = Translation.getClient(options)

  translator.translate(text)
    .addOnSuccessListener { result ->
      promise.resolve(result)
    }
    .addOnFailureListener { error ->
      promise.reject("TRANSLATION_ERROR", "Could not translate text", error)
    }
    .addOnCompleteListener {
      translator.close()
    }
}
  }
}
