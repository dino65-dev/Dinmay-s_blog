'use client'

import { Client, Databases, Storage, Account } from 'appwrite'
import { appwriteConfig } from './config'

let client: Client | null = null
let databases: Databases | null = null
let storage: Storage | null = null
let account: Account | null = null

export function getClient() {
  if (!client) {
    client = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId)
  }
  return client
}

export function getDatabases() {
  if (!databases) {
    databases = new Databases(getClient())
  }
  return databases
}

export function getStorage() {
  if (!storage) {
    storage = new Storage(getClient())
  }
  return storage
}

export function getAccount() {
  if (!account) {
    account = new Account(getClient())
  }
  return account
}