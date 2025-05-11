package com.turboxml

import com.facebook.react.bridge.*
import com.fasterxml.jackson.dataformat.xml.XmlMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import kotlinx.coroutines.*

class TurboxmlModule(
  reactContext: ReactApplicationContext
) : NativeTurboxmlSpec(reactContext) {

  private val xmlMapper = XmlMapper().apply {
    registerKotlinModule()
  }

  override fun parseXml(xml: String, promise: Promise) {
    CoroutineScope(Dispatchers.Default).launch {
      try {
        val parsed: Map<String, Any?> = xmlMapper.readValue(xml)
        val cleaned = clean(parsed)
        val normalized = normalize(cleaned)
        val rootTag = extractRoot(xml)
        val wrapped = mapOf(rootTag to normalized)
        val result = toWritableMap(wrapped)

        withContext(Dispatchers.Main) {
          promise.resolve(result)
        }
      } catch (e: Exception) {
        withContext(Dispatchers.Main) {
          promise.reject("XML_PARSE_ERROR", e.message, e)
        }
      }
    }
  }

  private fun extractRoot(xml: String): String {
    val regex = "<(\\w+)(\\s|>)".toRegex()
    return regex.find(xml)?.groupValues?.get(1) ?: "root"
  }

  private fun clean(map: Map<String, Any?>): Map<String, Any?> {
    return map.filterKeys { it.isNotBlank() }.mapValues { (_, value) ->
      when (value) {
        is Map<*, *> -> clean(value as Map<String, Any?>)
        is List<*> -> value.mapNotNull { item ->
          when (item) {
            is Map<*, *> -> clean(item as Map<String, Any?>)
            is String -> item.trim().takeIf { it.isNotEmpty() }
            else -> item
          }
        }.takeIf { it.isNotEmpty() }
        is String -> value.trim().takeIf { it.isNotEmpty() }
        else -> value
      }
    }
  }

  private fun normalize(map: Map<String, Any?>): Map<String, Any?> {
    return map.mapValues { (_, value) ->
      when (value) {
        is String -> listOf(value)
        is Map<*, *> -> listOf(normalize(value as Map<String, Any?>))
        is List<*> -> value.map { item ->
          when (item) {
            is Map<*, *> -> normalize(item as Map<String, Any?>)
            else -> item
          }
        }
        else -> value
      }
    }
  }

  private fun toWritableMap(map: Map<String, Any?>): WritableMap {
    val output = Arguments.createMap()
    map.forEach { (key, value) ->
      when (value) {
        is String -> output.putString(key, value)
        is Int -> output.putInt(key, value)
        is Double -> output.putDouble(key, value)
        is Boolean -> output.putBoolean(key, value)
        is Map<*, *> -> output.putMap(key, toWritableMap(value as Map<String, Any?>))
        is List<*> -> output.putArray(key, toWritableArray(value))
        is Number -> output.putDouble(key, value.toDouble())
        else -> output.putString(key, value?.toString() ?: "")
      }
    }
    return output
  }

  private fun toWritableArray(list: List<*>): WritableArray {
    val output = Arguments.createArray()
    list.forEach { item ->
      when (item) {
        is String -> output.pushString(item)
        is Int -> output.pushInt(item)
        is Double -> output.pushDouble(item)
        is Boolean -> output.pushBoolean(item)
        is Map<*, *> -> output.pushMap(toWritableMap(item as Map<String, Any?>))
        is List<*> -> output.pushArray(toWritableArray(item))
        is Number -> output.pushDouble(item.toDouble())
        else -> output.pushString(item?.toString() ?: "")
      }
    }
    return output
  }

  companion object {
    const val NAME = "Turboxml"
  }
}
