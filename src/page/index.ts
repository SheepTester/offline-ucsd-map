/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import { Interactive } from '../interactive/index.ts'
import { expect } from '../utils/expect.ts'
import { MapView } from '../view/index.ts'

const wrapper = document.getElementById('map') ?? expect('Map wrapper')
const view = new MapView(wrapper)
const interactive = new Interactive(wrapper, {
  get: () => view.view,
  set (transformation) {
    view.view = transformation
    view.render()
  }
})

Object.assign(window, { view })
