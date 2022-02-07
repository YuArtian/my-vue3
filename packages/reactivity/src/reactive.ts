import { isObject } from "@vue/shared";
import { track, trigger } from "./efftect";

const enum REACTIVE_FLAGS {
  IS_REACTIVE = '__v_isReactive'
}

const proxy_handler:ProxyHandler<object> = {
  get(target, key, recevier){
    // 已经代理过的对象不需要重复代理
    if(key === REACTIVE_FLAGS.IS_REACTIVE) {
      return true
    }
    //依赖收集
    track(target, key)
    return Reflect.get(target, key, recevier)
  },
  set(target, key, value, recevier){
    let old_value = (target as any)[key] //先取老值 顺序很重要
    let res = Reflect.set(target, key, value, recevier)//先设置值的变化，再触发更新
    if(old_value !== value) {
      //触发更新
      trigger(target, key)
    }
    return res
  },
}

// 缓存 对同一个对象 重复 reactive，是相等的
const reactive_map = new WeakMap()

function create_reactive_object(target: object){
  if (!isObject(target)) return target

  if((target as any)[REACTIVE_FLAGS.IS_REACTIVE]) {
    return target
  }

  const existing_proxy = reactive_map.get(target)
  if(existing_proxy) {
    return existing_proxy
  }

  const proxy = new Proxy(target, proxy_handler)
  reactive_map.set(target, proxy)
  return proxy
}

export function reactive (target: object) {
  return create_reactive_object(target)
}

