
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.52.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\gpio.svelte generated by Svelte v3.52.0 */

    const file$2 = "src\\components\\gpio.svelte";

    function create_fragment$2(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "step", "1");
    			attr_dev(input, "max", "255");
    			attr_dev(input, "class", "svelte-1p3lrxl");
    			add_location(input, file$2, 4, 0, 43);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*gpio*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*gpio*/ 1 && to_number(input.value) !== /*gpio*/ ctx[0]) {
    				set_input_value(input, /*gpio*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Gpio', slots, []);
    	let { gpio } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (gpio === undefined && !('gpio' in $$props || $$self.$$.bound[$$self.$$.props['gpio']])) {
    			console.warn("<Gpio> was created without expected prop 'gpio'");
    		}
    	});

    	const writable_props = ['gpio'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Gpio> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		gpio = to_number(this.value);
    		$$invalidate(0, gpio);
    	}

    	$$self.$$set = $$props => {
    		if ('gpio' in $$props) $$invalidate(0, gpio = $$props.gpio);
    	};

    	$$self.$capture_state = () => ({ gpio });

    	$$self.$inject_state = $$props => {
    		if ('gpio' in $$props) $$invalidate(0, gpio = $$props.gpio);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [gpio, input_input_handler];
    }

    class Gpio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { gpio: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gpio",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get gpio() {
    		throw new Error("<Gpio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gpio(value) {
    		throw new Error("<Gpio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\enable_button.svelte generated by Svelte v3.52.0 */

    const file$1 = "src\\components\\enable_button.svelte";

    function create_fragment$1(ctx) {
    	let span1;
    	let label;
    	let input;
    	let t;
    	let span0;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span1 = element("span");
    			label = element("label");
    			input = element("input");
    			t = space();
    			span0 = element("span");
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "svelte-18co7m5");
    			add_location(input, file$1, 6, 4, 100);
    			attr_dev(span0, "class", "slider svelte-18co7m5");
    			add_location(span0, file$1, 7, 4, 154);
    			attr_dev(label, "class", "switch svelte-18co7m5");
    			add_location(label, file$1, 5, 2, 72);
    			attr_dev(span1, "class", "sliderb svelte-18co7m5");
    			add_location(span1, file$1, 4, 0, 46);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span1, anchor);
    			append_dev(span1, label);
    			append_dev(label, input);
    			input.checked = /*enabled*/ ctx[0];
    			append_dev(label, t);
    			append_dev(label, span0);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*enabled*/ 1) {
    				input.checked = /*enabled*/ ctx[0];
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Enable_button', slots, []);
    	let { enabled } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (enabled === undefined && !('enabled' in $$props || $$self.$$.bound[$$self.$$.props['enabled']])) {
    			console.warn("<Enable_button> was created without expected prop 'enabled'");
    		}
    	});

    	const writable_props = ['enabled'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Enable_button> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		enabled = this.checked;
    		$$invalidate(0, enabled);
    	}

    	$$self.$$set = $$props => {
    		if ('enabled' in $$props) $$invalidate(0, enabled = $$props.enabled);
    	};

    	$$self.$capture_state = () => ({ enabled });

    	$$self.$inject_state = $$props => {
    		if ('enabled' in $$props) $$invalidate(0, enabled = $$props.enabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [enabled, input_change_handler];
    }

    class Enable_button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { enabled: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Enable_button",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get enabled() {
    		throw new Error("<Enable_button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set enabled(value) {
    		throw new Error("<Enable_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.52.0 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[42] = list[i].o;
    	child_ctx[43] = list;
    	child_ctx[44] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[42] = list[i].o;
    	child_ctx[45] = list;
    	child_ctx[44] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[42] = list[i].o;
    	child_ctx[46] = list;
    	child_ctx[44] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[47] = list[i].v;
    	child_ctx[48] = list;
    	child_ctx[44] = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[49] = list[i].st;
    	child_ctx[50] = list;
    	child_ctx[44] = i;
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[51] = list[i];
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[49] = list[i].st;
    	child_ctx[54] = list;
    	child_ctx[44] = i;
    	return child_ctx;
    }

    function get_each_context_7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[51] = list[i];
    	return child_ctx;
    }

    function get_each_context_8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[57] = list[i].ct;
    	child_ctx[58] = list;
    	child_ctx[44] = i;
    	return child_ctx;
    }

    function get_each_context_9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[51] = list[i];
    	return child_ctx;
    }

    function get_each_context_10(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[61] = list[i].input;
    	child_ctx[62] = list;
    	child_ctx[44] = i;
    	return child_ctx;
    }

    function get_each_context_11(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[51] = list[i];
    	return child_ctx;
    }

    function get_each_context_12(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[61] = list[i].input;
    	child_ctx[65] = list;
    	child_ctx[44] = i;
    	return child_ctx;
    }

    function get_each_context_13(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[61] = list[i].input;
    	child_ctx[66] = list;
    	child_ctx[44] = i;
    	return child_ctx;
    }

    function get_each_context_14(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[61] = list[i].input;
    	child_ctx[67] = list;
    	child_ctx[44] = i;
    	return child_ctx;
    }

    function get_each_context_15(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[68] = list[i].wf;
    	child_ctx[69] = list;
    	child_ctx[44] = i;
    	return child_ctx;
    }

    function get_each_context_16(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[68] = list[i].wf;
    	child_ctx[70] = list;
    	child_ctx[44] = i;
    	return child_ctx;
    }

    // (329:8) {#each deviceSettings.wf as { wf }
    function create_each_block_16(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[22].call(input, /*i*/ ctx[44]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "maxlength", "15");
    			input.disabled = /*i*/ ctx[44] == 0;
    			attr_dev(input, "class", "svelte-13vxyta");
    			add_location(input, file, 329, 10, 8530);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*deviceSettings*/ ctx[3].wf[/*i*/ ctx[44]].ssid);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*deviceSettings, InputType*/ 24 && input.value !== /*deviceSettings*/ ctx[3].wf[/*i*/ ctx[44]].ssid) {
    				set_input_value(input, /*deviceSettings*/ ctx[3].wf[/*i*/ ctx[44]].ssid);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_16.name,
    		type: "each",
    		source: "(329:8) {#each deviceSettings.wf as { wf }",
    		ctx
    	});

    	return block;
    }

    // (341:8) {#each deviceSettings.wf as { wf }
    function create_each_block_15(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	function input_input_handler_1() {
    		/*input_input_handler_1*/ ctx[23].call(input, /*i*/ ctx[44]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "password");
    			input.disabled = /*i*/ ctx[44] == 0;
    			attr_dev(input, "class", "svelte-13vxyta");
    			add_location(input, file, 341, 10, 8836);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*deviceSettings*/ ctx[3].wf[/*i*/ ctx[44]].pwd);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler_1);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*deviceSettings, InputType*/ 24 && input.value !== /*deviceSettings*/ ctx[3].wf[/*i*/ ctx[44]].pwd) {
    				set_input_value(input, /*deviceSettings*/ ctx[3].wf[/*i*/ ctx[44]].pwd);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_15.name,
    		type: "each",
    		source: "(341:8) {#each deviceSettings.wf as { wf }",
    		ctx
    	});

    	return block;
    }

    // (358:8) {#each deviceSettings.i as { input }
    function create_each_block_14(ctx) {
    	let enabledcomponent;
    	let updating_enabled;
    	let current;

    	function enabledcomponent_enabled_binding_1(value) {
    		/*enabledcomponent_enabled_binding_1*/ ctx[24](value, /*i*/ ctx[44]);
    	}

    	let enabledcomponent_props = {};

    	if (/*deviceSettings*/ ctx[3].i[/*i*/ ctx[44]].enabled !== void 0) {
    		enabledcomponent_props.enabled = /*deviceSettings*/ ctx[3].i[/*i*/ ctx[44]].enabled;
    	}

    	enabledcomponent = new Enable_button({
    			props: enabledcomponent_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(enabledcomponent, 'enabled', enabledcomponent_enabled_binding_1));

    	const block = {
    		c: function create() {
    			create_component(enabledcomponent.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(enabledcomponent, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const enabledcomponent_changes = {};

    			if (!updating_enabled && dirty[0] & /*deviceSettings*/ 8) {
    				updating_enabled = true;
    				enabledcomponent_changes.enabled = /*deviceSettings*/ ctx[3].i[/*i*/ ctx[44]].enabled;
    				add_flush_callback(() => updating_enabled = false);
    			}

    			enabledcomponent.$set(enabledcomponent_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(enabledcomponent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(enabledcomponent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(enabledcomponent, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_14.name,
    		type: "each",
    		source: "(358:8) {#each deviceSettings.i as { input }",
    		ctx
    	});

    	return block;
    }

    // (365:8) {#each deviceSettings.i as { input }
    function create_each_block_13(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	function input_input_handler_2() {
    		/*input_input_handler_2*/ ctx[25].call(input, /*i*/ ctx[44]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "maxlength", "15");
    			attr_dev(input, "class", "svelte-13vxyta");
    			add_location(input, file, 365, 10, 9464);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*deviceSettings*/ ctx[3].i[/*i*/ ctx[44]].name);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler_2);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*deviceSettings, InputType*/ 24 && input.value !== /*deviceSettings*/ ctx[3].i[/*i*/ ctx[44]].name) {
    				set_input_value(input, /*deviceSettings*/ ctx[3].i[/*i*/ ctx[44]].name);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_13.name,
    		type: "each",
    		source: "(365:8) {#each deviceSettings.i as { input }",
    		ctx
    	});

    	return block;
    }

    // (376:8) {#each deviceSettings.i as { input }
    function create_each_block_12(ctx) {
    	let gpiocomponent;
    	let updating_gpio;
    	let current;

    	function gpiocomponent_gpio_binding(value) {
    		/*gpiocomponent_gpio_binding*/ ctx[26](value, /*i*/ ctx[44]);
    	}

    	let gpiocomponent_props = {};

    	if (/*deviceSettings*/ ctx[3].i[/*i*/ ctx[44]].gpio !== void 0) {
    		gpiocomponent_props.gpio = /*deviceSettings*/ ctx[3].i[/*i*/ ctx[44]].gpio;
    	}

    	gpiocomponent = new Gpio({
    			props: gpiocomponent_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(gpiocomponent, 'gpio', gpiocomponent_gpio_binding));

    	const block = {
    		c: function create() {
    			create_component(gpiocomponent.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gpiocomponent, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const gpiocomponent_changes = {};

    			if (!updating_gpio && dirty[0] & /*deviceSettings*/ 8) {
    				updating_gpio = true;
    				gpiocomponent_changes.gpio = /*deviceSettings*/ ctx[3].i[/*i*/ ctx[44]].gpio;
    				add_flush_callback(() => updating_gpio = false);
    			}

    			gpiocomponent.$set(gpiocomponent_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gpiocomponent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gpiocomponent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gpiocomponent, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_12.name,
    		type: "each",
    		source: "(376:8) {#each deviceSettings.i as { input }",
    		ctx
    	});

    	return block;
    }

    // (385:14) {#each InputType as itype}
    function create_each_block_11(ctx) {
    	let option;
    	let t0_value = /*itype*/ ctx[51].text + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*itype*/ ctx[51].value;
    			option.value = option.__value;
    			add_location(option, file, 385, 16, 10071);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_11.name,
    		type: "each",
    		source: "(385:14) {#each InputType as itype}",
    		ctx
    	});

    	return block;
    }

    // (382:8) {#each deviceSettings.i as { input }
    function create_each_block_10(ctx) {
    	let div;
    	let select;
    	let t;
    	let mounted;
    	let dispose;
    	let each_value_11 = /*InputType*/ ctx[4];
    	validate_each_argument(each_value_11);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_11.length; i += 1) {
    		each_blocks[i] = create_each_block_11(get_each_context_11(ctx, each_value_11, i));
    	}

    	function select_change_handler() {
    		/*select_change_handler*/ ctx[27].call(select, /*i*/ ctx[44]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(select, "class", "svelte-13vxyta");
    			if (/*deviceSettings*/ ctx[3].i[/*i*/ ctx[44]].type === void 0) add_render_callback(select_change_handler);
    			add_location(select, file, 383, 12, 9967);
    			add_location(div, file, 382, 10, 9949);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*deviceSettings*/ ctx[3].i[/*i*/ ctx[44]].type);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", select_change_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*InputType*/ 16) {
    				each_value_11 = /*InputType*/ ctx[4];
    				validate_each_argument(each_value_11);
    				let i;

    				for (i = 0; i < each_value_11.length; i += 1) {
    					const child_ctx = get_each_context_11(ctx, each_value_11, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_11(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_11.length;
    			}

    			if (dirty[0] & /*deviceSettings, InputType*/ 24) {
    				select_option(select, /*deviceSettings*/ ctx[3].i[/*i*/ ctx[44]].type);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_10.name,
    		type: "each",
    		source: "(382:8) {#each deviceSettings.i as { input }",
    		ctx
    	});

    	return block;
    }

    // (400:14) {#each ContactType as itype}
    function create_each_block_9(ctx) {
    	let option;
    	let t0_value = /*itype*/ ctx[51].text + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*itype*/ ctx[51].value;
    			option.value = option.__value;
    			add_location(option, file, 400, 16, 10507);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_9.name,
    		type: "each",
    		source: "(400:14) {#each ContactType as itype}",
    		ctx
    	});

    	return block;
    }

    // (397:8) {#each deviceSettings.i as { ct }
    function create_each_block_8(ctx) {
    	let div;
    	let select;
    	let t;
    	let mounted;
    	let dispose;
    	let each_value_9 = /*ContactType*/ ctx[7];
    	validate_each_argument(each_value_9);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_9.length; i += 1) {
    		each_blocks[i] = create_each_block_9(get_each_context_9(ctx, each_value_9, i));
    	}

    	function select_change_handler_1() {
    		/*select_change_handler_1*/ ctx[28].call(select, /*i*/ ctx[44]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(select, "class", "svelte-13vxyta");
    			if (/*deviceSettings*/ ctx[3].i[/*i*/ ctx[44]].contact_type === void 0) add_render_callback(select_change_handler_1);
    			add_location(select, file, 398, 12, 10393);
    			add_location(div, file, 397, 10, 10375);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*deviceSettings*/ ctx[3].i[/*i*/ ctx[44]].contact_type);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", select_change_handler_1);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*ContactType*/ 128) {
    				each_value_9 = /*ContactType*/ ctx[7];
    				validate_each_argument(each_value_9);
    				let i;

    				for (i = 0; i < each_value_9.length; i += 1) {
    					const child_ctx = get_each_context_9(ctx, each_value_9, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_9(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_9.length;
    			}

    			if (dirty[0] & /*deviceSettings, InputType*/ 24) {
    				select_option(select, /*deviceSettings*/ ctx[3].i[/*i*/ ctx[44]].contact_type);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_8.name,
    		type: "each",
    		source: "(397:8) {#each deviceSettings.i as { ct }",
    		ctx
    	});

    	return block;
    }

    // (415:14) {#each SirenType as itype}
    function create_each_block_7(ctx) {
    	let option;
    	let t0_value = /*itype*/ ctx[51].text + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*itype*/ ctx[51].value;
    			option.value = option.__value;
    			add_location(option, file, 415, 16, 10937);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_7.name,
    		type: "each",
    		source: "(415:14) {#each SirenType as itype}",
    		ctx
    	});

    	return block;
    }

    // (412:8) {#each deviceSettings.i as { st }
    function create_each_block_6(ctx) {
    	let div;
    	let select;
    	let t;
    	let mounted;
    	let dispose;
    	let each_value_7 = /*SirenType*/ ctx[5];
    	validate_each_argument(each_value_7);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_7.length; i += 1) {
    		each_blocks[i] = create_each_block_7(get_each_context_7(ctx, each_value_7, i));
    	}

    	function select_change_handler_2() {
    		/*select_change_handler_2*/ ctx[29].call(select, /*i*/ ctx[44]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(select, "class", "svelte-13vxyta");
    			if (/*deviceSettings*/ ctx[3].i[/*i*/ ctx[44]].siren_type === void 0) add_render_callback(select_change_handler_2);
    			add_location(select, file, 413, 12, 10827);
    			add_location(div, file, 412, 10, 10809);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*deviceSettings*/ ctx[3].i[/*i*/ ctx[44]].siren_type);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", select_change_handler_2);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*SirenType*/ 32) {
    				each_value_7 = /*SirenType*/ ctx[5];
    				validate_each_argument(each_value_7);
    				let i;

    				for (i = 0; i < each_value_7.length; i += 1) {
    					const child_ctx = get_each_context_7(ctx, each_value_7, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_7.length;
    			}

    			if (dirty[0] & /*deviceSettings, InputType*/ 24) {
    				select_option(select, /*deviceSettings*/ ctx[3].i[/*i*/ ctx[44]].siren_type);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_6.name,
    		type: "each",
    		source: "(412:8) {#each deviceSettings.i as { st }",
    		ctx
    	});

    	return block;
    }

    // (429:14) {#each StatusZone as itype}
    function create_each_block_5(ctx) {
    	let option;
    	let t0_value = /*itype*/ ctx[51].text + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*itype*/ ctx[51].value;
    			option.value = option.__value;
    			add_location(option, file, 429, 16, 11365);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(429:14) {#each StatusZone as itype}",
    		ctx
    	});

    	return block;
    }

    // (426:8) {#each statusInputs as { st }
    function create_each_block_4(ctx) {
    	let div;
    	let select;
    	let t;
    	let mounted;
    	let dispose;
    	let each_value_5 = /*StatusZone*/ ctx[6];
    	validate_each_argument(each_value_5);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	function select_change_handler_3() {
    		/*select_change_handler_3*/ ctx[30].call(select, /*i*/ ctx[44]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			select.disabled = true;
    			attr_dev(select, "class", "svelte-13vxyta");
    			if (/*statusInputs*/ ctx[2][/*i*/ ctx[44]].status === void 0) add_render_callback(select_change_handler_3);
    			add_location(select, file, 427, 12, 11253);
    			add_location(div, file, 426, 10, 11235);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*statusInputs*/ ctx[2][/*i*/ ctx[44]].status);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", select_change_handler_3);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*StatusZone*/ 64) {
    				each_value_5 = /*StatusZone*/ ctx[6];
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_5.length;
    			}

    			if (dirty[0] & /*statusInputs, StatusZone*/ 68) {
    				select_option(select, /*statusInputs*/ ctx[2][/*i*/ ctx[44]].status);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(426:8) {#each statusInputs as { st }",
    		ctx
    	});

    	return block;
    }

    // (440:8) {#each statusInputs as { v }
    function create_each_block_3(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	function input_input_handler_3() {
    		/*input_input_handler_3*/ ctx[31].call(input, /*i*/ ctx[44]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			input.disabled = true;
    			attr_dev(input, "class", "svelte-13vxyta");
    			add_location(input, file, 440, 10, 11656);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*statusInputs*/ ctx[2][/*i*/ ctx[44]].value);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler_3);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*statusInputs, StatusZone*/ 68 && input.value !== /*statusInputs*/ ctx[2][/*i*/ ctx[44]].value) {
    				set_input_value(input, /*statusInputs*/ ctx[2][/*i*/ ctx[44]].value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(440:8) {#each statusInputs as { v }",
    		ctx
    	});

    	return block;
    }

    // (461:8) {#each deviceSettings.o as { o }
    function create_each_block_2(ctx) {
    	let enabledcomponent;
    	let updating_enabled;
    	let current;

    	function enabledcomponent_enabled_binding_2(value) {
    		/*enabledcomponent_enabled_binding_2*/ ctx[33](value, /*i*/ ctx[44]);
    	}

    	let enabledcomponent_props = {};

    	if (/*deviceSettings*/ ctx[3].o[/*i*/ ctx[44]].enabled !== void 0) {
    		enabledcomponent_props.enabled = /*deviceSettings*/ ctx[3].o[/*i*/ ctx[44]].enabled;
    	}

    	enabledcomponent = new Enable_button({
    			props: enabledcomponent_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(enabledcomponent, 'enabled', enabledcomponent_enabled_binding_2));

    	const block = {
    		c: function create() {
    			create_component(enabledcomponent.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(enabledcomponent, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const enabledcomponent_changes = {};

    			if (!updating_enabled && dirty[0] & /*deviceSettings*/ 8) {
    				updating_enabled = true;
    				enabledcomponent_changes.enabled = /*deviceSettings*/ ctx[3].o[/*i*/ ctx[44]].enabled;
    				add_flush_callback(() => updating_enabled = false);
    			}

    			enabledcomponent.$set(enabledcomponent_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(enabledcomponent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(enabledcomponent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(enabledcomponent, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(461:8) {#each deviceSettings.o as { o }",
    		ctx
    	});

    	return block;
    }

    // (468:8) {#each deviceSettings.o as { o }
    function create_each_block_1(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	function input_input_handler_4() {
    		/*input_input_handler_4*/ ctx[34].call(input, /*i*/ ctx[44]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "maxlength", "15");
    			attr_dev(input, "class", "svelte-13vxyta");
    			add_location(input, file, 468, 10, 12398);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*deviceSettings*/ ctx[3].o[/*i*/ ctx[44]].name);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler_4);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*deviceSettings, InputType*/ 24 && input.value !== /*deviceSettings*/ ctx[3].o[/*i*/ ctx[44]].name) {
    				set_input_value(input, /*deviceSettings*/ ctx[3].o[/*i*/ ctx[44]].name);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(468:8) {#each deviceSettings.o as { o }",
    		ctx
    	});

    	return block;
    }

    // (478:8) {#each deviceSettings.o as { o }
    function create_each_block(ctx) {
    	let gpiocomponent;
    	let updating_gpio;
    	let current;

    	function gpiocomponent_gpio_binding_2(value) {
    		/*gpiocomponent_gpio_binding_2*/ ctx[35](value, /*i*/ ctx[44]);
    	}

    	let gpiocomponent_props = {};

    	if (/*deviceSettings*/ ctx[3].o[/*i*/ ctx[44]].gpio !== void 0) {
    		gpiocomponent_props.gpio = /*deviceSettings*/ ctx[3].o[/*i*/ ctx[44]].gpio;
    	}

    	gpiocomponent = new Gpio({
    			props: gpiocomponent_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(gpiocomponent, 'gpio', gpiocomponent_gpio_binding_2));

    	const block = {
    		c: function create() {
    			create_component(gpiocomponent.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gpiocomponent, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const gpiocomponent_changes = {};

    			if (!updating_gpio && dirty[0] & /*deviceSettings*/ 8) {
    				updating_gpio = true;
    				gpiocomponent_changes.gpio = /*deviceSettings*/ ctx[3].o[/*i*/ ctx[44]].gpio;
    				add_flush_callback(() => updating_gpio = false);
    			}

    			gpiocomponent.$set(gpiocomponent_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gpiocomponent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gpiocomponent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gpiocomponent, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(478:8) {#each deviceSettings.o as { o }",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div36;
    	let h1;
    	let t1;
    	let div0;
    	let button0;
    	let t2;
    	let t3;
    	let button1;
    	let t4;
    	let t5;
    	let button2;
    	let t6;
    	let t7;
    	let fieldset0;
    	let legend0;
    	let t9;
    	let div3;
    	let div1;
    	let label0;
    	let t11;
    	let input0;
    	let t12;
    	let div2;
    	let label1;
    	let t14;
    	let input1;
    	let t15;
    	let div4;
    	let label2;
    	let t17;
    	let input2;
    	let t18;
    	let div5;
    	let label3;
    	let t20;
    	let input3;
    	let t21;
    	let div6;
    	let label4;
    	let t23;
    	let input4;
    	let t24;
    	let fieldset1;
    	let legend1;
    	let t26;
    	let div9;
    	let div7;
    	let label5;
    	let t28;
    	let input5;
    	let t29;
    	let div8;
    	let label6;
    	let t31;
    	let input6;
    	let t32;
    	let div10;
    	let label7;
    	let t34;
    	let input7;
    	let t35;
    	let div13;
    	let div11;
    	let enabledcomponent;
    	let updating_enabled;
    	let t36;
    	let div12;
    	let t38;
    	let div14;
    	let a_1;
    	let t39;
    	let a_1_href_value;
    	let t40;
    	let fieldset2;
    	let legend2;
    	let t42;
    	let div17;
    	let div15;
    	let label8;
    	let t44;
    	let t45;
    	let div16;
    	let label9;
    	let t47;
    	let t48;
    	let fieldset3;
    	let legend3;
    	let t50;
    	let div26;
    	let div18;
    	let label10;
    	let t52;
    	let t53;
    	let div19;
    	let label11;
    	let t55;
    	let t56;
    	let div20;
    	let label12;
    	let t58;
    	let t59;
    	let div21;
    	let label13;
    	let t61;
    	let t62;
    	let div22;
    	let label14;
    	let t64;
    	let t65;
    	let div23;
    	let label15;
    	let t67;
    	let t68;
    	let div24;
    	let label16;
    	let t70;
    	let t71;
    	let div25;
    	let label17;
    	let t73;
    	let t74;
    	let fieldset4;
    	let legend4;
    	let t76;
    	let div28;
    	let div27;
    	let label18;
    	let t78;
    	let gpiocomponent;
    	let updating_gpio;
    	let t79;
    	let div32;
    	let div29;
    	let label19;
    	let t81;
    	let t82;
    	let div30;
    	let label20;
    	let t84;
    	let t85;
    	let div31;
    	let label21;
    	let t87;
    	let t88;
    	let fieldset5;
    	let legend5;
    	let t90;
    	let textarea;
    	let t91;
    	let fieldset6;
    	let legend6;
    	let t93;
    	let div35;
    	let div33;
    	let label22;
    	let t95;
    	let input8;
    	let t96;
    	let div34;
    	let label23;
    	let t98;
    	let input9;
    	let current;
    	let mounted;
    	let dispose;

    	function enabledcomponent_enabled_binding(value) {
    		/*enabledcomponent_enabled_binding*/ ctx[21](value);
    	}

    	let enabledcomponent_props = {};

    	if (/*deviceSettings*/ ctx[3].acbgl !== void 0) {
    		enabledcomponent_props.enabled = /*deviceSettings*/ ctx[3].acbgl;
    	}

    	enabledcomponent = new Enable_button({
    			props: enabledcomponent_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(enabledcomponent, 'enabled', enabledcomponent_enabled_binding));
    	let each_value_16 = /*deviceSettings*/ ctx[3].wf;
    	validate_each_argument(each_value_16);
    	let each_blocks_12 = [];

    	for (let i = 0; i < each_value_16.length; i += 1) {
    		each_blocks_12[i] = create_each_block_16(get_each_context_16(ctx, each_value_16, i));
    	}

    	let each_value_15 = /*deviceSettings*/ ctx[3].wf;
    	validate_each_argument(each_value_15);
    	let each_blocks_11 = [];

    	for (let i = 0; i < each_value_15.length; i += 1) {
    		each_blocks_11[i] = create_each_block_15(get_each_context_15(ctx, each_value_15, i));
    	}

    	let each_value_14 = /*deviceSettings*/ ctx[3].i;
    	validate_each_argument(each_value_14);
    	let each_blocks_10 = [];

    	for (let i = 0; i < each_value_14.length; i += 1) {
    		each_blocks_10[i] = create_each_block_14(get_each_context_14(ctx, each_value_14, i));
    	}

    	const out = i => transition_out(each_blocks_10[i], 1, 1, () => {
    		each_blocks_10[i] = null;
    	});

    	let each_value_13 = /*deviceSettings*/ ctx[3].i;
    	validate_each_argument(each_value_13);
    	let each_blocks_9 = [];

    	for (let i = 0; i < each_value_13.length; i += 1) {
    		each_blocks_9[i] = create_each_block_13(get_each_context_13(ctx, each_value_13, i));
    	}

    	let each_value_12 = /*deviceSettings*/ ctx[3].i;
    	validate_each_argument(each_value_12);
    	let each_blocks_8 = [];

    	for (let i = 0; i < each_value_12.length; i += 1) {
    		each_blocks_8[i] = create_each_block_12(get_each_context_12(ctx, each_value_12, i));
    	}

    	const out_1 = i => transition_out(each_blocks_8[i], 1, 1, () => {
    		each_blocks_8[i] = null;
    	});

    	let each_value_10 = /*deviceSettings*/ ctx[3].i;
    	validate_each_argument(each_value_10);
    	let each_blocks_7 = [];

    	for (let i = 0; i < each_value_10.length; i += 1) {
    		each_blocks_7[i] = create_each_block_10(get_each_context_10(ctx, each_value_10, i));
    	}

    	let each_value_8 = /*deviceSettings*/ ctx[3].i;
    	validate_each_argument(each_value_8);
    	let each_blocks_6 = [];

    	for (let i = 0; i < each_value_8.length; i += 1) {
    		each_blocks_6[i] = create_each_block_8(get_each_context_8(ctx, each_value_8, i));
    	}

    	let each_value_6 = /*deviceSettings*/ ctx[3].i;
    	validate_each_argument(each_value_6);
    	let each_blocks_5 = [];

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		each_blocks_5[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
    	}

    	let each_value_4 = /*statusInputs*/ ctx[2];
    	validate_each_argument(each_value_4);
    	let each_blocks_4 = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks_4[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	let each_value_3 = /*statusInputs*/ ctx[2];
    	validate_each_argument(each_value_3);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_3[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	function gpiocomponent_gpio_binding_1(value) {
    		/*gpiocomponent_gpio_binding_1*/ ctx[32](value);
    	}

    	let gpiocomponent_props = {};

    	if (/*deviceSettings*/ ctx[3].led !== void 0) {
    		gpiocomponent_props.gpio = /*deviceSettings*/ ctx[3].led;
    	}

    	gpiocomponent = new Gpio({
    			props: gpiocomponent_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(gpiocomponent, 'gpio', gpiocomponent_gpio_binding_1));
    	let each_value_2 = /*deviceSettings*/ ctx[3].o;
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out_2 = i => transition_out(each_blocks_2[i], 1, 1, () => {
    		each_blocks_2[i] = null;
    	});

    	let each_value_1 = /*deviceSettings*/ ctx[3].o;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*deviceSettings*/ ctx[3].o;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out_3 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div36 = element("div");
    			h1 = element("h1");
    			h1.textContent = "OPEN COMMUNITY SAFETY";
    			t1 = space();
    			div0 = element("div");
    			button0 = element("button");
    			t2 = text("Reboot Board.");
    			t3 = space();
    			button1 = element("button");
    			t4 = text("Get settings");
    			t5 = space();
    			button2 = element("button");
    			t6 = text("Save settings");
    			t7 = space();
    			fieldset0 = element("fieldset");
    			legend0 = element("legend");
    			legend0.textContent = "General";
    			t9 = space();
    			div3 = element("div");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Chip Model";
    			t11 = space();
    			input0 = element("input");
    			t12 = space();
    			div2 = element("div");
    			label1 = element("label");
    			label1.textContent = "MAC";
    			t14 = space();
    			input1 = element("input");
    			t15 = space();
    			div4 = element("div");
    			label2 = element("label");
    			label2.textContent = "Name";
    			t17 = space();
    			input2 = element("input");
    			t18 = space();
    			div5 = element("div");
    			label3 = element("label");
    			label3.textContent = "Device ID";
    			t20 = space();
    			input3 = element("input");
    			t21 = space();
    			div6 = element("div");
    			label4 = element("label");
    			label4.textContent = "Websocket Host";
    			t23 = space();
    			input4 = element("input");
    			t24 = space();
    			fieldset1 = element("fieldset");
    			legend1 = element("legend");
    			legend1.textContent = "Geolocation";
    			t26 = space();
    			div9 = element("div");
    			div7 = element("div");
    			label5 = element("label");
    			label5.textContent = "Latitude";
    			t28 = space();
    			input5 = element("input");
    			t29 = space();
    			div8 = element("div");
    			label6 = element("label");
    			label6.textContent = "Longitude";
    			t31 = space();
    			input6 = element("input");
    			t32 = space();
    			div10 = element("div");
    			label7 = element("label");
    			label7.textContent = "From Open Street Maps Link";
    			t34 = space();
    			input7 = element("input");
    			t35 = space();
    			div13 = element("div");
    			div11 = element("div");
    			create_component(enabledcomponent.$$.fragment);
    			t36 = space();
    			div12 = element("div");
    			div12.textContent = "Allow device for community use by geolocation";
    			t38 = space();
    			div14 = element("div");
    			a_1 = element("a");
    			t39 = text("Show on Open Street Maps");
    			t40 = space();
    			fieldset2 = element("fieldset");
    			legend2 = element("legend");
    			legend2.textContent = "WIFI";
    			t42 = space();
    			div17 = element("div");
    			div15 = element("div");
    			label8 = element("label");
    			label8.textContent = "SSID Name";
    			t44 = space();

    			for (let i = 0; i < each_blocks_12.length; i += 1) {
    				each_blocks_12[i].c();
    			}

    			t45 = space();
    			div16 = element("div");
    			label9 = element("label");
    			label9.textContent = "Password";
    			t47 = space();

    			for (let i = 0; i < each_blocks_11.length; i += 1) {
    				each_blocks_11[i].c();
    			}

    			t48 = space();
    			fieldset3 = element("fieldset");
    			legend3 = element("legend");
    			legend3.textContent = "Inputs";
    			t50 = space();
    			div26 = element("div");
    			div18 = element("div");
    			label10 = element("label");
    			label10.textContent = "Enabled";
    			t52 = space();

    			for (let i = 0; i < each_blocks_10.length; i += 1) {
    				each_blocks_10[i].c();
    			}

    			t53 = space();
    			div19 = element("div");
    			label11 = element("label");
    			label11.textContent = "Label";
    			t55 = space();

    			for (let i = 0; i < each_blocks_9.length; i += 1) {
    				each_blocks_9[i].c();
    			}

    			t56 = space();
    			div20 = element("div");
    			label12 = element("label");
    			label12.textContent = "GPIO";
    			t58 = space();

    			for (let i = 0; i < each_blocks_8.length; i += 1) {
    				each_blocks_8[i].c();
    			}

    			t59 = space();
    			div21 = element("div");
    			label13 = element("label");
    			label13.textContent = "Input Type";
    			t61 = space();

    			for (let i = 0; i < each_blocks_7.length; i += 1) {
    				each_blocks_7[i].c();
    			}

    			t62 = space();
    			div22 = element("div");
    			label14 = element("label");
    			label14.textContent = "Contact Type";
    			t64 = space();

    			for (let i = 0; i < each_blocks_6.length; i += 1) {
    				each_blocks_6[i].c();
    			}

    			t65 = space();
    			div23 = element("div");
    			label15 = element("label");
    			label15.textContent = "Siren Type";
    			t67 = space();

    			for (let i = 0; i < each_blocks_5.length; i += 1) {
    				each_blocks_5[i].c();
    			}

    			t68 = space();
    			div24 = element("div");
    			label16 = element("label");
    			label16.textContent = "Status Zone";
    			t70 = space();

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].c();
    			}

    			t71 = space();
    			div25 = element("div");
    			label17 = element("label");
    			label17.textContent = "Value";
    			t73 = space();

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t74 = space();
    			fieldset4 = element("fieldset");
    			legend4 = element("legend");
    			legend4.textContent = "Outputs";
    			t76 = space();
    			div28 = element("div");
    			div27 = element("div");
    			label18 = element("label");
    			label18.textContent = "Led GPIO";
    			t78 = space();
    			create_component(gpiocomponent.$$.fragment);
    			t79 = space();
    			div32 = element("div");
    			div29 = element("div");
    			label19 = element("label");
    			label19.textContent = "Enabled";
    			t81 = space();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t82 = space();
    			div30 = element("div");
    			label20 = element("label");
    			label20.textContent = "Label";
    			t84 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t85 = space();
    			div31 = element("div");
    			label21 = element("label");
    			label21.textContent = "GPIO";
    			t87 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t88 = space();
    			fieldset5 = element("fieldset");
    			legend5 = element("legend");
    			legend5.textContent = "SSL Certificate";
    			t90 = space();
    			textarea = element("textarea");
    			t91 = space();
    			fieldset6 = element("fieldset");
    			legend6 = element("legend");
    			legend6.textContent = "Config File";
    			t93 = space();
    			div35 = element("div");
    			div33 = element("div");
    			label22 = element("label");
    			label22.textContent = "Load from file";
    			t95 = space();
    			input8 = element("input");
    			t96 = space();
    			div34 = element("div");
    			label23 = element("label");
    			label23.textContent = "Download file";
    			t98 = space();
    			input9 = element("input");
    			set_style(h1, "color", "darkblue");
    			add_location(h1, file, 231, 2, 5754);
    			attr_dev(button0, "class", "button button1 svelte-13vxyta");
    			button0.disabled = /*rebooting*/ ctx[1];
    			add_location(button0, file, 233, 4, 5840);
    			attr_dev(button1, "class", "button button1 svelte-13vxyta");
    			button1.disabled = /*rebooting*/ ctx[1];
    			add_location(button1, file, 236, 4, 5949);
    			attr_dev(button2, "class", "button button1 svelte-13vxyta");
    			button2.disabled = /*rebooting*/ ctx[1];
    			add_location(button2, file, 239, 4, 6062);
    			attr_dev(div0, "class", "button_ali svelte-13vxyta");
    			add_location(div0, file, 232, 2, 5811);
    			attr_dev(legend0, "class", "legent svelte-13vxyta");
    			add_location(legend0, file, 245, 4, 6212);
    			attr_dev(label0, "for", "fname");
    			add_location(label0, file, 249, 8, 6317);
    			input0.disabled = true;
    			attr_dev(input0, "class", "svelte-13vxyta");
    			add_location(input0, file, 250, 8, 6363);
    			attr_dev(div1, "class", "f5 svelte-13vxyta");
    			add_location(div1, file, 248, 6, 6292);
    			attr_dev(label1, "for", "lname");
    			add_location(label1, file, 254, 8, 6465);
    			input1.disabled = true;
    			attr_dev(input1, "class", "svelte-13vxyta");
    			add_location(input1, file, 255, 8, 6504);
    			attr_dev(div2, "class", "f5 svelte-13vxyta");
    			add_location(div2, file, 253, 6, 6440);
    			attr_dev(div3, "class", "flex-container svelte-13vxyta");
    			add_location(div3, file, 247, 4, 6257);
    			attr_dev(label2, "for", "fname");
    			add_location(label2, file, 260, 6, 6601);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "name", "deviceId");
    			attr_dev(input2, "maxlength", "30");
    			attr_dev(input2, "class", "svelte-13vxyta");
    			add_location(input2, file, 261, 6, 6639);
    			add_location(div4, file, 259, 4, 6589);
    			attr_dev(label3, "for", "fname");
    			add_location(label3, file, 270, 6, 6791);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "name", "deviceId");
    			attr_dev(input3, "maxlength", "50");
    			attr_dev(input3, "class", "svelte-13vxyta");
    			add_location(input3, file, 271, 6, 6834);
    			add_location(div5, file, 269, 4, 6779);
    			attr_dev(label4, "for", "fname");
    			add_location(label4, file, 280, 6, 6990);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "name", "wsHost");
    			attr_dev(input4, "class", "svelte-13vxyta");
    			add_location(input4, file, 281, 6, 7038);
    			add_location(div6, file, 279, 4, 6978);
    			attr_dev(fieldset0, "class", "fset svelte-13vxyta");
    			add_location(fieldset0, file, 244, 2, 6184);
    			attr_dev(legend1, "class", "legent svelte-13vxyta");
    			add_location(legend1, file, 286, 4, 7165);
    			attr_dev(label5, "for", "fname");
    			add_location(label5, file, 290, 8, 7274);
    			attr_dev(input5, "type", "text");
    			attr_dev(input5, "class", "svelte-13vxyta");
    			add_location(input5, file, 291, 8, 7318);
    			attr_dev(div7, "class", "f5 svelte-13vxyta");
    			add_location(div7, file, 289, 6, 7249);
    			attr_dev(label6, "for", "lname");
    			add_location(label6, file, 295, 8, 7422);
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "class", "svelte-13vxyta");
    			add_location(input6, file, 296, 8, 7467);
    			attr_dev(div8, "class", "f5 svelte-13vxyta");
    			add_location(div8, file, 294, 6, 7397);
    			attr_dev(div9, "class", "flex-container svelte-13vxyta");
    			add_location(div9, file, 288, 4, 7214);
    			attr_dev(label7, "for", "lname");
    			add_location(label7, file, 301, 6, 7568);
    			attr_dev(input7, "type", "text");
    			attr_dev(input7, "class", "svelte-13vxyta");
    			add_location(input7, file, 302, 6, 7628);
    			add_location(div10, file, 300, 4, 7556);
    			attr_dev(div11, "class", "f0 svelte-13vxyta");
    			add_location(div11, file, 306, 6, 7750);
    			attr_dev(div12, "class", "f6 svelte-13vxyta");
    			add_location(div12, file, 309, 6, 7851);
    			attr_dev(div13, "class", "flex-container svelte-13vxyta");
    			add_location(div13, file, 305, 4, 7715);
    			attr_dev(a_1, "target", "_blank");
    			attr_dev(a_1, "href", a_1_href_value = `https://www.openstreetmap.org/?mlat=${/*deviceSettings*/ ctx[3].latitude}&mlon=${/*deviceSettings*/ ctx[3].longitude}#map=19/${/*deviceSettings*/ ctx[3].latitude}/${/*deviceSettings*/ ctx[3].longitude}`);
    			add_location(a_1, file, 314, 6, 8031);
    			attr_dev(div14, "class", "href_gelocation svelte-13vxyta");
    			add_location(div14, file, 312, 4, 7935);
    			attr_dev(fieldset1, "class", "fset svelte-13vxyta");
    			add_location(fieldset1, file, 285, 2, 7137);
    			attr_dev(legend2, "class", "legent svelte-13vxyta");
    			add_location(legend2, file, 323, 4, 8334);
    			attr_dev(label8, "for", "fname");
    			add_location(label8, file, 327, 8, 8436);
    			attr_dev(div15, "class", "f5 svelte-13vxyta");
    			add_location(div15, file, 326, 6, 8411);
    			attr_dev(label9, "for", "lname");
    			add_location(label9, file, 339, 8, 8743);
    			attr_dev(div16, "class", "f5 svelte-13vxyta");
    			add_location(div16, file, 338, 6, 8718);
    			attr_dev(div17, "class", "flex-container svelte-13vxyta");
    			add_location(div17, file, 325, 4, 8376);
    			attr_dev(fieldset2, "class", "fset svelte-13vxyta");
    			add_location(fieldset2, file, 322, 2, 8306);
    			attr_dev(legend3, "class", "legent svelte-13vxyta");
    			add_location(legend3, file, 352, 4, 9049);
    			attr_dev(label10, "for", "lname");
    			add_location(label10, file, 356, 8, 9153);
    			attr_dev(div18, "class", "f0 svelte-13vxyta");
    			add_location(div18, file, 355, 6, 9128);
    			attr_dev(label11, "for", "lname");
    			add_location(label11, file, 363, 8, 9372);
    			attr_dev(div19, "class", "f4 svelte-13vxyta");
    			add_location(div19, file, 362, 6, 9347);
    			attr_dev(label12, "for", "fname");
    			add_location(label12, file, 374, 8, 9646);
    			attr_dev(div20, "class", "f1 svelte-13vxyta");
    			add_location(div20, file, 373, 6, 9621);
    			attr_dev(label13, "for", "fname");
    			add_location(label13, file, 380, 8, 9852);
    			attr_dev(div21, "class", "f2 svelte-13vxyta");
    			add_location(div21, file, 379, 6, 9827);
    			attr_dev(label14, "for", "fname");
    			add_location(label14, file, 395, 8, 10279);
    			attr_dev(div22, "class", "f2 svelte-13vxyta");
    			add_location(div22, file, 394, 6, 10254);
    			attr_dev(label15, "for", "fname");
    			add_location(label15, file, 410, 8, 10715);
    			attr_dev(div23, "class", "f2 svelte-13vxyta");
    			add_location(div23, file, 409, 6, 10690);
    			attr_dev(label16, "for", "fname");
    			add_location(label16, file, 424, 8, 11144);
    			attr_dev(div24, "class", "f2 svelte-13vxyta");
    			add_location(div24, file, 423, 6, 11119);
    			attr_dev(label17, "for", "lname");
    			add_location(label17, file, 438, 8, 11572);
    			attr_dev(div25, "class", "f1 svelte-13vxyta");
    			add_location(div25, file, 437, 6, 11547);
    			attr_dev(div26, "class", "flex-container svelte-13vxyta");
    			add_location(div26, file, 354, 4, 9093);
    			attr_dev(fieldset3, "class", "fset svelte-13vxyta");
    			add_location(fieldset3, file, 351, 2, 9021);
    			attr_dev(legend4, "class", "legent svelte-13vxyta");
    			add_location(legend4, file, 447, 4, 11807);
    			attr_dev(label18, "for", "lname");
    			add_location(label18, file, 451, 8, 11912);
    			attr_dev(div27, "class", "f0 svelte-13vxyta");
    			add_location(div27, file, 450, 6, 11887);
    			attr_dev(div28, "class", "flex-container svelte-13vxyta");
    			add_location(div28, file, 449, 4, 11852);
    			attr_dev(label19, "for", "lname");
    			add_location(label19, file, 459, 8, 12095);
    			attr_dev(div29, "class", "f0 svelte-13vxyta");
    			add_location(div29, file, 458, 6, 12070);
    			attr_dev(label20, "for", "lname");
    			add_location(label20, file, 466, 8, 12310);
    			attr_dev(div30, "class", "f6 svelte-13vxyta");
    			add_location(div30, file, 465, 6, 12285);
    			attr_dev(label21, "for", "fname");
    			add_location(label21, file, 476, 8, 12579);
    			attr_dev(div31, "class", "f3 svelte-13vxyta");
    			add_location(div31, file, 475, 6, 12554);
    			attr_dev(div32, "class", "flex-container svelte-13vxyta");
    			add_location(div32, file, 457, 4, 12035);
    			attr_dev(fieldset4, "class", "fset svelte-13vxyta");
    			add_location(fieldset4, file, 446, 2, 11779);
    			attr_dev(legend5, "class", "legent svelte-13vxyta");
    			add_location(legend5, file, 519, 4, 13707);
    			attr_dev(textarea, "class", "ca svelte-13vxyta");
    			attr_dev(textarea, "rows", "25");
    			attr_dev(textarea, "cols", "50");
    			add_location(textarea, file, 520, 4, 13759);
    			attr_dev(fieldset5, "class", "fset svelte-13vxyta");
    			add_location(fieldset5, file, 518, 2, 13679);
    			attr_dev(legend6, "class", "legent svelte-13vxyta");
    			add_location(legend6, file, 523, 4, 13879);
    			attr_dev(label22, "for", "fname");
    			add_location(label22, file, 527, 8, 13988);
    			attr_dev(input8, "type", "file");
    			attr_dev(input8, "accept", ".json");
    			attr_dev(input8, "class", "svelte-13vxyta");
    			add_location(input8, file, 528, 8, 14038);
    			attr_dev(div33, "class", "f5 svelte-13vxyta");
    			add_location(div33, file, 526, 6, 13963);
    			attr_dev(label23, "for", "fname");
    			add_location(label23, file, 540, 8, 14314);
    			attr_dev(input9, "type", "button");
    			attr_dev(input9, "accept", ".json");
    			input9.value = "Download";
    			attr_dev(input9, "class", "svelte-13vxyta");
    			add_location(input9, file, 541, 8, 14363);
    			attr_dev(div34, "class", "f5 svelte-13vxyta");
    			add_location(div34, file, 539, 6, 14289);
    			attr_dev(div35, "class", "flex-container svelte-13vxyta");
    			add_location(div35, file, 525, 4, 13928);
    			attr_dev(fieldset6, "class", "fset svelte-13vxyta");
    			add_location(fieldset6, file, 522, 2, 13851);
    			attr_dev(div36, "class", "bg");
    			add_location(div36, file, 230, 0, 5735);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div36, anchor);
    			append_dev(div36, h1);
    			append_dev(div36, t1);
    			append_dev(div36, div0);
    			append_dev(div0, button0);
    			append_dev(button0, t2);
    			append_dev(div0, t3);
    			append_dev(div0, button1);
    			append_dev(button1, t4);
    			append_dev(div0, t5);
    			append_dev(div0, button2);
    			append_dev(button2, t6);
    			append_dev(div36, t7);
    			append_dev(div36, fieldset0);
    			append_dev(fieldset0, legend0);
    			append_dev(fieldset0, t9);
    			append_dev(fieldset0, div3);
    			append_dev(div3, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t11);
    			append_dev(div1, input0);
    			set_input_value(input0, /*deviceSettings*/ ctx[3].ChipModel);
    			append_dev(div3, t12);
    			append_dev(div3, div2);
    			append_dev(div2, label1);
    			append_dev(div2, t14);
    			append_dev(div2, input1);
    			set_input_value(input1, /*deviceSettings*/ ctx[3].EfuseMac);
    			append_dev(fieldset0, t15);
    			append_dev(fieldset0, div4);
    			append_dev(div4, label2);
    			append_dev(div4, t17);
    			append_dev(div4, input2);
    			set_input_value(input2, /*deviceSettings*/ ctx[3].name);
    			append_dev(fieldset0, t18);
    			append_dev(fieldset0, div5);
    			append_dev(div5, label3);
    			append_dev(div5, t20);
    			append_dev(div5, input3);
    			set_input_value(input3, /*deviceSettings*/ ctx[3].deviceId);
    			append_dev(fieldset0, t21);
    			append_dev(fieldset0, div6);
    			append_dev(div6, label4);
    			append_dev(div6, t23);
    			append_dev(div6, input4);
    			set_input_value(input4, /*deviceSettings*/ ctx[3].wsHost);
    			append_dev(div36, t24);
    			append_dev(div36, fieldset1);
    			append_dev(fieldset1, legend1);
    			append_dev(fieldset1, t26);
    			append_dev(fieldset1, div9);
    			append_dev(div9, div7);
    			append_dev(div7, label5);
    			append_dev(div7, t28);
    			append_dev(div7, input5);
    			set_input_value(input5, /*deviceSettings*/ ctx[3].latitude);
    			append_dev(div9, t29);
    			append_dev(div9, div8);
    			append_dev(div8, label6);
    			append_dev(div8, t31);
    			append_dev(div8, input6);
    			set_input_value(input6, /*deviceSettings*/ ctx[3].longitude);
    			append_dev(fieldset1, t32);
    			append_dev(fieldset1, div10);
    			append_dev(div10, label7);
    			append_dev(div10, t34);
    			append_dev(div10, input7);
    			set_input_value(input7, /*link_osm*/ ctx[0]);
    			append_dev(fieldset1, t35);
    			append_dev(fieldset1, div13);
    			append_dev(div13, div11);
    			mount_component(enabledcomponent, div11, null);
    			append_dev(div13, t36);
    			append_dev(div13, div12);
    			append_dev(fieldset1, t38);
    			append_dev(fieldset1, div14);
    			append_dev(div14, a_1);
    			append_dev(a_1, t39);
    			append_dev(div36, t40);
    			append_dev(div36, fieldset2);
    			append_dev(fieldset2, legend2);
    			append_dev(fieldset2, t42);
    			append_dev(fieldset2, div17);
    			append_dev(div17, div15);
    			append_dev(div15, label8);
    			append_dev(div15, t44);

    			for (let i = 0; i < each_blocks_12.length; i += 1) {
    				each_blocks_12[i].m(div15, null);
    			}

    			append_dev(div17, t45);
    			append_dev(div17, div16);
    			append_dev(div16, label9);
    			append_dev(div16, t47);

    			for (let i = 0; i < each_blocks_11.length; i += 1) {
    				each_blocks_11[i].m(div16, null);
    			}

    			append_dev(div36, t48);
    			append_dev(div36, fieldset3);
    			append_dev(fieldset3, legend3);
    			append_dev(fieldset3, t50);
    			append_dev(fieldset3, div26);
    			append_dev(div26, div18);
    			append_dev(div18, label10);
    			append_dev(div18, t52);

    			for (let i = 0; i < each_blocks_10.length; i += 1) {
    				each_blocks_10[i].m(div18, null);
    			}

    			append_dev(div26, t53);
    			append_dev(div26, div19);
    			append_dev(div19, label11);
    			append_dev(div19, t55);

    			for (let i = 0; i < each_blocks_9.length; i += 1) {
    				each_blocks_9[i].m(div19, null);
    			}

    			append_dev(div26, t56);
    			append_dev(div26, div20);
    			append_dev(div20, label12);
    			append_dev(div20, t58);

    			for (let i = 0; i < each_blocks_8.length; i += 1) {
    				each_blocks_8[i].m(div20, null);
    			}

    			append_dev(div26, t59);
    			append_dev(div26, div21);
    			append_dev(div21, label13);
    			append_dev(div21, t61);

    			for (let i = 0; i < each_blocks_7.length; i += 1) {
    				each_blocks_7[i].m(div21, null);
    			}

    			append_dev(div26, t62);
    			append_dev(div26, div22);
    			append_dev(div22, label14);
    			append_dev(div22, t64);

    			for (let i = 0; i < each_blocks_6.length; i += 1) {
    				each_blocks_6[i].m(div22, null);
    			}

    			append_dev(div26, t65);
    			append_dev(div26, div23);
    			append_dev(div23, label15);
    			append_dev(div23, t67);

    			for (let i = 0; i < each_blocks_5.length; i += 1) {
    				each_blocks_5[i].m(div23, null);
    			}

    			append_dev(div26, t68);
    			append_dev(div26, div24);
    			append_dev(div24, label16);
    			append_dev(div24, t70);

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].m(div24, null);
    			}

    			append_dev(div26, t71);
    			append_dev(div26, div25);
    			append_dev(div25, label17);
    			append_dev(div25, t73);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(div25, null);
    			}

    			append_dev(div36, t74);
    			append_dev(div36, fieldset4);
    			append_dev(fieldset4, legend4);
    			append_dev(fieldset4, t76);
    			append_dev(fieldset4, div28);
    			append_dev(div28, div27);
    			append_dev(div27, label18);
    			append_dev(div27, t78);
    			mount_component(gpiocomponent, div27, null);
    			append_dev(fieldset4, t79);
    			append_dev(fieldset4, div32);
    			append_dev(div32, div29);
    			append_dev(div29, label19);
    			append_dev(div29, t81);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div29, null);
    			}

    			append_dev(div32, t82);
    			append_dev(div32, div30);
    			append_dev(div30, label20);
    			append_dev(div30, t84);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div30, null);
    			}

    			append_dev(div32, t85);
    			append_dev(div32, div31);
    			append_dev(div31, label21);
    			append_dev(div31, t87);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div31, null);
    			}

    			append_dev(div36, t88);
    			append_dev(div36, fieldset5);
    			append_dev(fieldset5, legend5);
    			append_dev(fieldset5, t90);
    			append_dev(fieldset5, textarea);
    			set_input_value(textarea, /*deviceSettings*/ ctx[3].cfp);
    			append_dev(div36, t91);
    			append_dev(div36, fieldset6);
    			append_dev(fieldset6, legend6);
    			append_dev(fieldset6, t93);
    			append_dev(fieldset6, div35);
    			append_dev(div35, div33);
    			append_dev(div33, label22);
    			append_dev(div33, t95);
    			append_dev(div33, input8);
    			append_dev(div35, t96);
    			append_dev(div35, div34);
    			append_dev(div34, label23);
    			append_dev(div34, t98);
    			append_dev(div34, input9);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*reboot*/ ctx[12], false, false, false),
    					listen_dev(button1, "click", /*getSettings*/ ctx[9], false, false, false),
    					listen_dev(button2, "click", /*setSettings*/ ctx[8], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[13]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[14]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[15]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[16]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[17]),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[18]),
    					listen_dev(input6, "input", /*input6_input_handler*/ ctx[19]),
    					listen_dev(input7, "input", /*input7_input_handler*/ ctx[20]),
    					listen_dev(input7, "change", /*getGeoFromLink*/ ctx[11], false, false, false),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[36]),
    					listen_dev(input8, "change", /*change_handler*/ ctx[37], false, false, false),
    					listen_dev(input9, "click", /*click_handler*/ ctx[38], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*rebooting*/ 2) {
    				prop_dev(button0, "disabled", /*rebooting*/ ctx[1]);
    			}

    			if (!current || dirty[0] & /*rebooting*/ 2) {
    				prop_dev(button1, "disabled", /*rebooting*/ ctx[1]);
    			}

    			if (!current || dirty[0] & /*rebooting*/ 2) {
    				prop_dev(button2, "disabled", /*rebooting*/ ctx[1]);
    			}

    			if (dirty[0] & /*deviceSettings, InputType*/ 24 && input0.value !== /*deviceSettings*/ ctx[3].ChipModel) {
    				set_input_value(input0, /*deviceSettings*/ ctx[3].ChipModel);
    			}

    			if (dirty[0] & /*deviceSettings, InputType*/ 24 && input1.value !== /*deviceSettings*/ ctx[3].EfuseMac) {
    				set_input_value(input1, /*deviceSettings*/ ctx[3].EfuseMac);
    			}

    			if (dirty[0] & /*deviceSettings, InputType*/ 24 && input2.value !== /*deviceSettings*/ ctx[3].name) {
    				set_input_value(input2, /*deviceSettings*/ ctx[3].name);
    			}

    			if (dirty[0] & /*deviceSettings, InputType*/ 24 && input3.value !== /*deviceSettings*/ ctx[3].deviceId) {
    				set_input_value(input3, /*deviceSettings*/ ctx[3].deviceId);
    			}

    			if (dirty[0] & /*deviceSettings, InputType*/ 24 && input4.value !== /*deviceSettings*/ ctx[3].wsHost) {
    				set_input_value(input4, /*deviceSettings*/ ctx[3].wsHost);
    			}

    			if (dirty[0] & /*deviceSettings, InputType*/ 24 && input5.value !== /*deviceSettings*/ ctx[3].latitude) {
    				set_input_value(input5, /*deviceSettings*/ ctx[3].latitude);
    			}

    			if (dirty[0] & /*deviceSettings, InputType*/ 24 && input6.value !== /*deviceSettings*/ ctx[3].longitude) {
    				set_input_value(input6, /*deviceSettings*/ ctx[3].longitude);
    			}

    			if (dirty[0] & /*link_osm*/ 1 && input7.value !== /*link_osm*/ ctx[0]) {
    				set_input_value(input7, /*link_osm*/ ctx[0]);
    			}

    			const enabledcomponent_changes = {};

    			if (!updating_enabled && dirty[0] & /*deviceSettings*/ 8) {
    				updating_enabled = true;
    				enabledcomponent_changes.enabled = /*deviceSettings*/ ctx[3].acbgl;
    				add_flush_callback(() => updating_enabled = false);
    			}

    			enabledcomponent.$set(enabledcomponent_changes);

    			if (!current || dirty[0] & /*deviceSettings, InputType*/ 24 && a_1_href_value !== (a_1_href_value = `https://www.openstreetmap.org/?mlat=${/*deviceSettings*/ ctx[3].latitude}&mlon=${/*deviceSettings*/ ctx[3].longitude}#map=19/${/*deviceSettings*/ ctx[3].latitude}/${/*deviceSettings*/ ctx[3].longitude}`)) {
    				attr_dev(a_1, "href", a_1_href_value);
    			}

    			if (dirty[0] & /*deviceSettings*/ 8) {
    				each_value_16 = /*deviceSettings*/ ctx[3].wf;
    				validate_each_argument(each_value_16);
    				let i;

    				for (i = 0; i < each_value_16.length; i += 1) {
    					const child_ctx = get_each_context_16(ctx, each_value_16, i);

    					if (each_blocks_12[i]) {
    						each_blocks_12[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_12[i] = create_each_block_16(child_ctx);
    						each_blocks_12[i].c();
    						each_blocks_12[i].m(div15, null);
    					}
    				}

    				for (; i < each_blocks_12.length; i += 1) {
    					each_blocks_12[i].d(1);
    				}

    				each_blocks_12.length = each_value_16.length;
    			}

    			if (dirty[0] & /*deviceSettings*/ 8) {
    				each_value_15 = /*deviceSettings*/ ctx[3].wf;
    				validate_each_argument(each_value_15);
    				let i;

    				for (i = 0; i < each_value_15.length; i += 1) {
    					const child_ctx = get_each_context_15(ctx, each_value_15, i);

    					if (each_blocks_11[i]) {
    						each_blocks_11[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_11[i] = create_each_block_15(child_ctx);
    						each_blocks_11[i].c();
    						each_blocks_11[i].m(div16, null);
    					}
    				}

    				for (; i < each_blocks_11.length; i += 1) {
    					each_blocks_11[i].d(1);
    				}

    				each_blocks_11.length = each_value_15.length;
    			}

    			if (dirty[0] & /*deviceSettings*/ 8) {
    				each_value_14 = /*deviceSettings*/ ctx[3].i;
    				validate_each_argument(each_value_14);
    				let i;

    				for (i = 0; i < each_value_14.length; i += 1) {
    					const child_ctx = get_each_context_14(ctx, each_value_14, i);

    					if (each_blocks_10[i]) {
    						each_blocks_10[i].p(child_ctx, dirty);
    						transition_in(each_blocks_10[i], 1);
    					} else {
    						each_blocks_10[i] = create_each_block_14(child_ctx);
    						each_blocks_10[i].c();
    						transition_in(each_blocks_10[i], 1);
    						each_blocks_10[i].m(div18, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_14.length; i < each_blocks_10.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*deviceSettings*/ 8) {
    				each_value_13 = /*deviceSettings*/ ctx[3].i;
    				validate_each_argument(each_value_13);
    				let i;

    				for (i = 0; i < each_value_13.length; i += 1) {
    					const child_ctx = get_each_context_13(ctx, each_value_13, i);

    					if (each_blocks_9[i]) {
    						each_blocks_9[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_9[i] = create_each_block_13(child_ctx);
    						each_blocks_9[i].c();
    						each_blocks_9[i].m(div19, null);
    					}
    				}

    				for (; i < each_blocks_9.length; i += 1) {
    					each_blocks_9[i].d(1);
    				}

    				each_blocks_9.length = each_value_13.length;
    			}

    			if (dirty[0] & /*deviceSettings*/ 8) {
    				each_value_12 = /*deviceSettings*/ ctx[3].i;
    				validate_each_argument(each_value_12);
    				let i;

    				for (i = 0; i < each_value_12.length; i += 1) {
    					const child_ctx = get_each_context_12(ctx, each_value_12, i);

    					if (each_blocks_8[i]) {
    						each_blocks_8[i].p(child_ctx, dirty);
    						transition_in(each_blocks_8[i], 1);
    					} else {
    						each_blocks_8[i] = create_each_block_12(child_ctx);
    						each_blocks_8[i].c();
    						transition_in(each_blocks_8[i], 1);
    						each_blocks_8[i].m(div20, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_12.length; i < each_blocks_8.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*deviceSettings, InputType*/ 24) {
    				each_value_10 = /*deviceSettings*/ ctx[3].i;
    				validate_each_argument(each_value_10);
    				let i;

    				for (i = 0; i < each_value_10.length; i += 1) {
    					const child_ctx = get_each_context_10(ctx, each_value_10, i);

    					if (each_blocks_7[i]) {
    						each_blocks_7[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_7[i] = create_each_block_10(child_ctx);
    						each_blocks_7[i].c();
    						each_blocks_7[i].m(div21, null);
    					}
    				}

    				for (; i < each_blocks_7.length; i += 1) {
    					each_blocks_7[i].d(1);
    				}

    				each_blocks_7.length = each_value_10.length;
    			}

    			if (dirty[0] & /*deviceSettings, ContactType*/ 136) {
    				each_value_8 = /*deviceSettings*/ ctx[3].i;
    				validate_each_argument(each_value_8);
    				let i;

    				for (i = 0; i < each_value_8.length; i += 1) {
    					const child_ctx = get_each_context_8(ctx, each_value_8, i);

    					if (each_blocks_6[i]) {
    						each_blocks_6[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_6[i] = create_each_block_8(child_ctx);
    						each_blocks_6[i].c();
    						each_blocks_6[i].m(div22, null);
    					}
    				}

    				for (; i < each_blocks_6.length; i += 1) {
    					each_blocks_6[i].d(1);
    				}

    				each_blocks_6.length = each_value_8.length;
    			}

    			if (dirty[0] & /*deviceSettings, SirenType*/ 40) {
    				each_value_6 = /*deviceSettings*/ ctx[3].i;
    				validate_each_argument(each_value_6);
    				let i;

    				for (i = 0; i < each_value_6.length; i += 1) {
    					const child_ctx = get_each_context_6(ctx, each_value_6, i);

    					if (each_blocks_5[i]) {
    						each_blocks_5[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_5[i] = create_each_block_6(child_ctx);
    						each_blocks_5[i].c();
    						each_blocks_5[i].m(div23, null);
    					}
    				}

    				for (; i < each_blocks_5.length; i += 1) {
    					each_blocks_5[i].d(1);
    				}

    				each_blocks_5.length = each_value_6.length;
    			}

    			if (dirty[0] & /*statusInputs, StatusZone*/ 68) {
    				each_value_4 = /*statusInputs*/ ctx[2];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks_4[i]) {
    						each_blocks_4[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_4[i] = create_each_block_4(child_ctx);
    						each_blocks_4[i].c();
    						each_blocks_4[i].m(div24, null);
    					}
    				}

    				for (; i < each_blocks_4.length; i += 1) {
    					each_blocks_4[i].d(1);
    				}

    				each_blocks_4.length = each_value_4.length;
    			}

    			if (dirty[0] & /*statusInputs*/ 4) {
    				each_value_3 = /*statusInputs*/ ctx[2];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_3[i] = create_each_block_3(child_ctx);
    						each_blocks_3[i].c();
    						each_blocks_3[i].m(div25, null);
    					}
    				}

    				for (; i < each_blocks_3.length; i += 1) {
    					each_blocks_3[i].d(1);
    				}

    				each_blocks_3.length = each_value_3.length;
    			}

    			const gpiocomponent_changes = {};

    			if (!updating_gpio && dirty[0] & /*deviceSettings*/ 8) {
    				updating_gpio = true;
    				gpiocomponent_changes.gpio = /*deviceSettings*/ ctx[3].led;
    				add_flush_callback(() => updating_gpio = false);
    			}

    			gpiocomponent.$set(gpiocomponent_changes);

    			if (dirty[0] & /*deviceSettings*/ 8) {
    				each_value_2 = /*deviceSettings*/ ctx[3].o;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    						transition_in(each_blocks_2[i], 1);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						transition_in(each_blocks_2[i], 1);
    						each_blocks_2[i].m(div29, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks_2.length; i += 1) {
    					out_2(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*deviceSettings*/ 8) {
    				each_value_1 = /*deviceSettings*/ ctx[3].o;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div30, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty[0] & /*deviceSettings*/ 8) {
    				each_value = /*deviceSettings*/ ctx[3].o;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div31, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_3(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*deviceSettings, InputType*/ 24) {
    				set_input_value(textarea, /*deviceSettings*/ ctx[3].cfp);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(enabledcomponent.$$.fragment, local);

    			for (let i = 0; i < each_value_14.length; i += 1) {
    				transition_in(each_blocks_10[i]);
    			}

    			for (let i = 0; i < each_value_12.length; i += 1) {
    				transition_in(each_blocks_8[i]);
    			}

    			transition_in(gpiocomponent.$$.fragment, local);

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_2[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(enabledcomponent.$$.fragment, local);
    			each_blocks_10 = each_blocks_10.filter(Boolean);

    			for (let i = 0; i < each_blocks_10.length; i += 1) {
    				transition_out(each_blocks_10[i]);
    			}

    			each_blocks_8 = each_blocks_8.filter(Boolean);

    			for (let i = 0; i < each_blocks_8.length; i += 1) {
    				transition_out(each_blocks_8[i]);
    			}

    			transition_out(gpiocomponent.$$.fragment, local);
    			each_blocks_2 = each_blocks_2.filter(Boolean);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				transition_out(each_blocks_2[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div36);
    			destroy_component(enabledcomponent);
    			destroy_each(each_blocks_12, detaching);
    			destroy_each(each_blocks_11, detaching);
    			destroy_each(each_blocks_10, detaching);
    			destroy_each(each_blocks_9, detaching);
    			destroy_each(each_blocks_8, detaching);
    			destroy_each(each_blocks_7, detaching);
    			destroy_each(each_blocks_6, detaching);
    			destroy_each(each_blocks_5, detaching);
    			destroy_each(each_blocks_4, detaching);
    			destroy_each(each_blocks_3, detaching);
    			destroy_component(gpiocomponent);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	let InputType = [
    		{ text: "NONE", value: 0 },
    		{ text: "ALARM_MEDICAL", value: 100 },
    		{ text: "ALARM_FIRE", value: 101 },
    		{ text: "ALARM_PANIC", value: 102 },
    		{ text: "ALARM_BURGLARY", value: 103 },
    		{ text: "ALARM_GENERAL", value: 104 },
    		{ text: "ALARM_24H", value: 105 }
    	];

    	let SirenType = [
    		{ text: "UNABLED", value: 0 },
    		{ text: "SILENT", value: 1 },
    		{ text: "CONTINUOUS", value: 2 },
    		{ text: "PULSING", value: 3 },
    		{ text: "TEST", vaue: 4 }
    	];

    	let StatusZone = [
    		{ text: "TROUBLE", value: 3 },
    		{ text: "NORMAL", value: 1 },
    		{ text: "ALARM", value: 2 },
    		{ text: "UNDEFINED", value: 0 }
    	];

    	let ContactType = [{ text: "NORMALLY_CLOSED", value: 1 }, { text: "NORMALLY_OPENED", value: 2 }];
    	var link_osm = "";
    	var rebooting = false;
    	var statusInputs = [];

    	var deviceSettings = {
    		MAX_SSID_WIFI: 3,
    		wsHost: "",
    		cfp: "",
    		name: "Unknow",
    		acbgl: false,
    		latitude: 0,
    		longitude: 0,
    		deviceId: "",
    		i: [],
    		o: [],
    		//    tg: [],
    		wf: [{ ssid: "", pwd: "" }, { ssid: "", pwd: "" }, { ssid: "", pwd: "" }]
    	};

    	function getLocation() {
    		if (navigator.geolocation) {
    			navigator.geolocation.getCurrentPosition(position => {
    				$$invalidate(3, deviceSettings = {
    					latitude: position.coords.latitude,
    					longitude: position.coords.longitude
    				});
    			});
    		} else {
    			alert("Geolocation is not supported by this browser.");
    		}
    	}

    	async function setSettings() {
    		if (confirm("Desea guardar los cambios?")) {
    			try {
    				let response = await fetch("/setsettings", {
    					method: "POST",
    					headers: { "Content-Type": "application/json" },
    					body: JSON.stringify(deviceSettings)
    				});

    				let data = await response.json();
    				console.log(data);

    				if (data) {
    					alert("Guardado");
    				}
    			} catch(error) {
    				console.log(error);
    			}
    		}
    	}

    	async function getSettings() {
    		try {
    			let response = await fetch("/getsettings");
    			let data = await response.json();

    			//    console.log("Retorna settings", deviceSettings);
    			setValues(data);
    		} catch(error) {
    			console.trace(error); /*
    if (data) {
      deviceSettings = {
        MAX_SSID_WIFI: data.MAX_SSID_WIFI || 3,
        cfp: data.cfp || "",
        acbgl: data.acbgl || false,
        wsHost: data.wsHost || "",
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        deviceId: data.deviceId || "",
        name: data.name || "",
        led: data.led || 255,
        i: data.i || [],
        o: data.o || [],
        //tg: data.tg || [],
        wf: data.wf || [],
        ChipModel: data.ChipModel || "",
        EfuseMac: data.EfuseMac || "",
      };
      

      //        console.log("settings 1: ", deviceSettings);

      deviceSettings.tg = deviceSettings.tg.map((tg) => {
        return {
          id: tg.id || "",
          name: tg.name || "",
          enabled: tg.enabled || false,
        };
      });

      console.log("settings 2: ", deviceSettings);
    }
    */
    		}
    	}

    	function setValues(data) {
    		if (data) {
    			$$invalidate(3, deviceSettings = {
    				MAX_SSID_WIFI: data.MAX_SSID_WIFI || 3,
    				cfp: data.cfp || "",
    				acbgl: data.acbgl || false,
    				wsHost: data.wsHost || "",
    				latitude: data.latitude || 0,
    				longitude: data.longitude || 0,
    				deviceId: data.deviceId || "",
    				name: data.name || "",
    				led: data.led || 255,
    				i: data.i || [],
    				o: data.o || [],
    				//tg: data.tg || [],
    				wf: data.wf || [],
    				ChipModel: data.ChipModel || "",
    				EfuseMac: data.EfuseMac || ""
    			});
    		}
    	}

    	async function getInputStatus() {
    		try {
    			let response = await fetch("/getinputsstatus");
    			let data = await response.json();
    			console.log("getInputStatus : ", data);

    			if (data && Array.isArray(data)) {
    				$$invalidate(2, statusInputs = data);
    			} else {
    				$$invalidate(2, statusInputs = []);
    			}
    		} catch(error) {
    			console.trace(error);
    		}
    	}

    	function readFile(file) {
    		// Check if the file is an image.
    		console.log(file);

    		if (file.type && !file.type.startsWith("application/json")) {
    			console.log("File is not json.", file.type, file);
    			return;
    		}

    		const reader = new FileReader();

    		reader.addEventListener("load", event => {
    			//img.src = event.target.result;
    			console.log(event.target.result);

    			setValues(event.target.result);
    		});

    		reader.readAsDataURL(file);
    	}

    	function getGeoFromLink() {
    		try {
    			let params = new URL(link_osm).searchParams;
    			$$invalidate(3, deviceSettings.latitude = params.get("mlat"), deviceSettings); // is the string "Jonathan Smith".
    			$$invalidate(3, deviceSettings.longitude = params.get("mlon"), deviceSettings); // is the string "Jonathan Smith".
    		} catch(error) {
    			alert("El link ingresado no es válido");
    		}
    	}

    	async function reboot() {
    		if (confirm("Desea reiniciar la placa?")) {
    			try {
    				await fetch("/reboot", { method: "GET" });
    				$$invalidate(1, rebooting = true);

    				setTimeout(
    					async () => {
    						$$invalidate(1, rebooting = false);
    						await getsettings();
    					},
    					10000
    				);
    			} catch(error) {
    				console.log(error);
    			}
    		}
    	}

    	onMount(() => {
    		setInterval(
    			async () => {
    				await getInputStatus();
    			},
    			1500
    		);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		deviceSettings.ChipModel = this.value;
    		$$invalidate(3, deviceSettings);
    		$$invalidate(4, InputType);
    	}

    	function input1_input_handler() {
    		deviceSettings.EfuseMac = this.value;
    		$$invalidate(3, deviceSettings);
    		$$invalidate(4, InputType);
    	}

    	function input2_input_handler() {
    		deviceSettings.name = this.value;
    		$$invalidate(3, deviceSettings);
    		$$invalidate(4, InputType);
    	}

    	function input3_input_handler() {
    		deviceSettings.deviceId = this.value;
    		$$invalidate(3, deviceSettings);
    		$$invalidate(4, InputType);
    	}

    	function input4_input_handler() {
    		deviceSettings.wsHost = this.value;
    		$$invalidate(3, deviceSettings);
    		$$invalidate(4, InputType);
    	}

    	function input5_input_handler() {
    		deviceSettings.latitude = this.value;
    		$$invalidate(3, deviceSettings);
    		$$invalidate(4, InputType);
    	}

    	function input6_input_handler() {
    		deviceSettings.longitude = this.value;
    		$$invalidate(3, deviceSettings);
    		$$invalidate(4, InputType);
    	}

    	function input7_input_handler() {
    		link_osm = this.value;
    		$$invalidate(0, link_osm);
    	}

    	function enabledcomponent_enabled_binding(value) {
    		if ($$self.$$.not_equal(deviceSettings.acbgl, value)) {
    			deviceSettings.acbgl = value;
    			$$invalidate(3, deviceSettings);
    		}
    	}

    	function input_input_handler(i) {
    		deviceSettings.wf[i].ssid = this.value;
    		$$invalidate(3, deviceSettings);
    		$$invalidate(4, InputType);
    	}

    	function input_input_handler_1(i) {
    		deviceSettings.wf[i].pwd = this.value;
    		$$invalidate(3, deviceSettings);
    		$$invalidate(4, InputType);
    	}

    	function enabledcomponent_enabled_binding_1(value, i) {
    		if ($$self.$$.not_equal(deviceSettings.i[i].enabled, value)) {
    			deviceSettings.i[i].enabled = value;
    			$$invalidate(3, deviceSettings);
    		}
    	}

    	function input_input_handler_2(i) {
    		deviceSettings.i[i].name = this.value;
    		$$invalidate(3, deviceSettings);
    		$$invalidate(4, InputType);
    	}

    	function gpiocomponent_gpio_binding(value, i) {
    		if ($$self.$$.not_equal(deviceSettings.i[i].gpio, value)) {
    			deviceSettings.i[i].gpio = value;
    			$$invalidate(3, deviceSettings);
    		}
    	}

    	function select_change_handler(i) {
    		deviceSettings.i[i].type = select_value(this);
    		$$invalidate(3, deviceSettings);
    		$$invalidate(4, InputType);
    	}

    	function select_change_handler_1(i) {
    		deviceSettings.i[i].contact_type = select_value(this);
    		$$invalidate(3, deviceSettings);
    		$$invalidate(4, InputType);
    	}

    	function select_change_handler_2(i) {
    		deviceSettings.i[i].siren_type = select_value(this);
    		$$invalidate(3, deviceSettings);
    		$$invalidate(4, InputType);
    	}

    	function select_change_handler_3(i) {
    		statusInputs[i].status = select_value(this);
    		$$invalidate(2, statusInputs);
    		$$invalidate(6, StatusZone);
    	}

    	function input_input_handler_3(i) {
    		statusInputs[i].value = this.value;
    		$$invalidate(2, statusInputs);
    		$$invalidate(6, StatusZone);
    	}

    	function gpiocomponent_gpio_binding_1(value) {
    		if ($$self.$$.not_equal(deviceSettings.led, value)) {
    			deviceSettings.led = value;
    			$$invalidate(3, deviceSettings);
    		}
    	}

    	function enabledcomponent_enabled_binding_2(value, i) {
    		if ($$self.$$.not_equal(deviceSettings.o[i].enabled, value)) {
    			deviceSettings.o[i].enabled = value;
    			$$invalidate(3, deviceSettings);
    		}
    	}

    	function input_input_handler_4(i) {
    		deviceSettings.o[i].name = this.value;
    		$$invalidate(3, deviceSettings);
    		$$invalidate(4, InputType);
    	}

    	function gpiocomponent_gpio_binding_2(value, i) {
    		if ($$self.$$.not_equal(deviceSettings.o[i].gpio, value)) {
    			deviceSettings.o[i].gpio = value;
    			$$invalidate(3, deviceSettings);
    		}
    	}

    	function textarea_input_handler() {
    		deviceSettings.cfp = this.value;
    		$$invalidate(3, deviceSettings);
    		$$invalidate(4, InputType);
    	}

    	const change_handler = event => {
    		const fileList = event.target.files;
    		console.log(fileList);
    		readFile(fileList[0]);
    	};

    	const click_handler = event => {
    		let name_file = deviceSettings.name || deviceSettings.deviceId || "unknow";
    		let url = window.URL.createObjectURL(new Blob([JSON.stringify(deviceSettings, null, 2)], { type: "application/json" }));
    		var a = document.createElement("a");
    		a.href = url;
    		a.download = name_file + ".json";
    		document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
    		a.click();
    		a.remove(); //afterwards we remove the element again
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		GpioComponent: Gpio,
    		EnabledComponent: Enable_button,
    		InputType,
    		SirenType,
    		StatusZone,
    		ContactType,
    		link_osm,
    		rebooting,
    		statusInputs,
    		deviceSettings,
    		getLocation,
    		setSettings,
    		getSettings,
    		setValues,
    		getInputStatus,
    		readFile,
    		getGeoFromLink,
    		reboot
    	});

    	$$self.$inject_state = $$props => {
    		if ('InputType' in $$props) $$invalidate(4, InputType = $$props.InputType);
    		if ('SirenType' in $$props) $$invalidate(5, SirenType = $$props.SirenType);
    		if ('StatusZone' in $$props) $$invalidate(6, StatusZone = $$props.StatusZone);
    		if ('ContactType' in $$props) $$invalidate(7, ContactType = $$props.ContactType);
    		if ('link_osm' in $$props) $$invalidate(0, link_osm = $$props.link_osm);
    		if ('rebooting' in $$props) $$invalidate(1, rebooting = $$props.rebooting);
    		if ('statusInputs' in $$props) $$invalidate(2, statusInputs = $$props.statusInputs);
    		if ('deviceSettings' in $$props) $$invalidate(3, deviceSettings = $$props.deviceSettings);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		link_osm,
    		rebooting,
    		statusInputs,
    		deviceSettings,
    		InputType,
    		SirenType,
    		StatusZone,
    		ContactType,
    		setSettings,
    		getSettings,
    		readFile,
    		getGeoFromLink,
    		reboot,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		input6_input_handler,
    		input7_input_handler,
    		enabledcomponent_enabled_binding,
    		input_input_handler,
    		input_input_handler_1,
    		enabledcomponent_enabled_binding_1,
    		input_input_handler_2,
    		gpiocomponent_gpio_binding,
    		select_change_handler,
    		select_change_handler_1,
    		select_change_handler_2,
    		select_change_handler_3,
    		input_input_handler_3,
    		gpiocomponent_gpio_binding_1,
    		enabledcomponent_enabled_binding_2,
    		input_input_handler_4,
    		gpiocomponent_gpio_binding_2,
    		textarea_input_handler,
    		change_handler,
    		click_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'Edwin'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
