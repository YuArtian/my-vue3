import { isObject } from "@vue/shared";

const proxy_handler = {

}

function create_reactive_object(target: object){
  if (!isObject(target)) return target
  const proxy = new Proxy(target, proxy_handler)
}

export function reactive (target: object) {
  return create_reactive_object(target)
}