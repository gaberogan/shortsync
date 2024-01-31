import { SignalOptions, createRoot, createSignal } from 'solid-js'
import LocalStorage from './LocalStorage'

export const createGlobalSignal = <T>(value: T, options?: SignalOptions<T>) =>
  createRoot(() => createSignal<T>(value, options))

export const createStoredGlobalSignal = <T>(key: string, defaultValue?: T, options?: SignalOptions<T>) =>
  createRoot(() => {
    const [getter, _setter] = createSignal<T>(LocalStorage.get(key) ?? defaultValue ?? null, options)

    const setter = (value: Exclude<T, Function>) => {
      LocalStorage.set(key, value)
      _setter(value)
    }

    return [getter, setter] as [typeof getter, typeof setter]
  })
