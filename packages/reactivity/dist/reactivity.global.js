var VueReactivity = (function (exports) {
  'use strict';

  function isObject(value) {
      return typeof value === 'object' && value != null;
  }

  //全局的 effect 调用栈 和 当前effect
  let active_effect;
  let effect_stack = [];
  class ReactiveEffect {
      constructor(fn) {
          this.fn = fn;
          this.active = true;
          this.deps = [];
      }
      //运行
      run() {
          if (!this.active) {
              return this.fn();
          }
          if (!effect_stack.includes(this)) {
              try {
                  effect_stack.push(active_effect = this);
                  this.fn(); //执行fn的时候，会触发取值 get
              }
              finally {
                  effect_stack.pop();
                  active_effect = effect_stack[effect_stack.length - 1];
              }
          }
      }
      //停止
      stop() {
          if (!this.active) {
              return;
          }
          cleanup_effect(this);
          this.active = false;
      }
  }
  //清空
  function cleanup_effect(effect) {
      const { deps } = effect;
      for (const dep of deps) {
          dep.delete(effect);
      }
  }
  const target_map = new WeakMap();
  //依赖收集
  function track(target, key) {
      if (!is_tracking()) {
          return;
      }
      let deps_map = target_map.get(target);
      if (!deps_map) {
          target_map.set(target, deps_map = new Map());
      }
      let dep = deps_map.get(key);
      if (!dep) {
          deps_map.set(key, (dep = new Set()));
      }
      let should_track = !dep.has(active_effect);
      if (should_track) {
          dep.add(active_effect); //一个属性对应多个 effect
          active_effect === null || active_effect === void 0 ? void 0 : active_effect.deps.push(dep); //一个 effect 对应多个属性
      }
  }
  // 是否进行收集 （只收集在 effect函数中的变量）
  function is_tracking() {
      return active_effect !== undefined;
  }
  //触发更新
  function trigger(target, key) {
      let deps_map = target_map.get(target);
      if (!deps_map) {
          return;
      }
      let deps = [];
      if (key !== undefined) {
          deps.push(deps_map.get(key));
      }
      let effects = [];
      for (const dep of deps) {
          effects.push(...dep);
      }
      for (const effect of effects) {
          if (effect !== active_effect) { //防止循环
              effect.run();
          }
      }
  }
  function effect(fn) {
      const _effect = new ReactiveEffect(fn);
      _effect.run();
      let runner = _effect.run.bind(_effect);
      runner.effect = _effect;
      return runner;
  }

  const proxy_handler = {
      get(target, key, recevier) {
          // 已经代理过的对象不需要重复代理
          if (key === "__v_isReactive" /* IS_REACTIVE */) {
              return true;
          }
          //依赖收集
          track(target, key);
          return Reflect.get(target, key, recevier);
      },
      set(target, key, value, recevier) {
          let old_value = target[key]; //先取老值 顺序很重要
          let res = Reflect.set(target, key, value, recevier); //先设置值的变化，再触发更新
          if (old_value !== value) {
              //触发更新
              trigger(target, key);
          }
          return res;
      },
  };
  // 缓存 对同一个对象 重复 reactive，是相等的
  const reactive_map = new WeakMap();
  function create_reactive_object(target) {
      if (!isObject(target))
          return target;
      if (target["__v_isReactive" /* IS_REACTIVE */]) {
          return target;
      }
      const existing_proxy = reactive_map.get(target);
      if (existing_proxy) {
          return existing_proxy;
      }
      const proxy = new Proxy(target, proxy_handler);
      reactive_map.set(target, proxy);
      return proxy;
  }
  function reactive(target) {
      return create_reactive_object(target);
  }

  exports.effect = effect;
  exports.reactive = reactive;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
//# sourceMappingURL=reactivity.global.js.map
