

//全局的 effect 调用栈 和 当前effect
let active_effect: ReactiveEffect | undefined
let effect_stack:[] = []


export class ReactiveEffect<T = any> {
  active = true
  deps:Set<ReactiveEffect>[] = []

  constructor(public fn: () => T, public scheduler?){

  }
  //运行
  run(){
    if (!this.active) {
      return this.fn()
    }
    if(!effect_stack.includes(this as never)) {
      try {
        effect_stack.push(active_effect = this as never)
        return this.fn() //执行fn的时候，会触发取值 get
      } finally {
        effect_stack.pop()
        active_effect = effect_stack[effect_stack.length -1]
      }
    }
  }
  //停止
  stop(){
    if (!this.active) {
      return
    }
    cleanup_effect(this)
    this.active = false
  }
}

//清空
function cleanup_effect(effect: ReactiveEffect) {
  const { deps } = effect
  for (const dep of deps) {
    dep.delete(effect)
  }
}

const target_map = new WeakMap()
//依赖收集
export function track (target:{}, key:unknown) {
  if (!is_tracking()) {
    return
  }
  let deps_map = target_map.get(target)
  if(!deps_map) {
    target_map.set(target, deps_map = new Map())
  }
  let dep = deps_map.get(key)
  if (!dep) {
    deps_map.set(key, (dep = new Set()))
  }
  track_effect(dep)
}
//收集属性
export function track_effect(dep){
  let should_track = !dep.has(active_effect)
  if (should_track) {
    dep.add(active_effect) //一个属性对应多个 effect
    active_effect?.deps.push(dep as never) //一个 effect 对应多个属性
  }
}
// 是否进行收集 （只收集在 effect函数中的变量）
export function is_tracking () {
  return active_effect !== undefined
}

//触发更新
export function trigger (target:{}, key:unknown) {
  let deps_map = target_map.get(target)
  if (!deps_map) {
    return
  }
  let deps = []
  if(key !== undefined) {
    deps.push(deps_map.get(key))
  }
  let effects = []
  for (const dep of deps) {
    effects.push(...dep)
  }
  trigger_effects(effects)
}

//触发 effects 执行
export function trigger_effects (effects) {
  for (const effect of effects) {
    if(effect !== active_effect) { //防止循环
      //设置值的时候 不触发 computed effect 的 get了，改为执行 scheduler
      if (effect.scheduler) {
        return effect.scheduler()
      }
      effect.run()
    }
  }
}

export interface ReactiveEffectRunner<T = any> {
  (): T
  effect: ReactiveEffect
}

export function effect<T = any> (fn:() => T):ReactiveEffectRunner {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
  let runner = _effect.run.bind(_effect) as ReactiveEffectRunner
  runner.effect = _effect
  return runner
}