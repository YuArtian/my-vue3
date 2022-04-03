import { is_function } from "@vue/shared";
import { is_tracking, ReactiveEffect, track_effect, trigger_effects } from "./efftect";


class ComputedRefImpl<T> {
  public dep;
  public _value !: T
  public _dirty = true
  public readonly effect: ReactiveEffect<T>
  public readonly __v_isRef = true

  constructor(getter, private readonly _setter){
    this.effect = new ReactiveEffect(getter, () => {
      // 在 scheduler 中将 _dirty 重置为 true，并且触发 计算属性 相关的 effect 执行
      if (!this._dirty) {
        this._dirty = true
        trigger_effects(this.dep)
      }
    })
  }

  get value(){
    if (is_tracking()) {
      track_effect(this.dep || (this.dep = new Set()))
    }
    if (this._dirty) {
      console.log('ComputedRefImpl get')
      this._value = this.effect.run()
      this._dirty = false
    }
    console.log('this _value', this._value)
    return this._value
  }
  set value(new_value){
    this._setter(new_value)
  }
}


export function computed (getter_or_options) {
  const only_getter = is_function(getter_or_options)
  let getter
  let setter
  if(only_getter){
    getter = getter_or_options
    setter = () => {}
  } else {
    getter = getter_or_options.get
    setter = getter_or_options.set
  }
  return new ComputedRefImpl(getter, setter)
}

