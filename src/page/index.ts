/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import { Interactive } from '../interactive/index.ts'
import { expect } from '../utils/expect.ts'
import { makeTransformation } from '../utils/transformation.ts'
import { MapView } from '../view/index.ts'
import { center } from '../view/lat-long.ts'

const wrapper = document.getElementById('map') ?? expect('Map wrapper')
const view = new MapView(wrapper)
view.view = makeTransformation({
  scale: 0.25
})
const interactive = new Interactive(wrapper, {
  get: () => view.view,
  set (transformation) {
    view.view = transformation
    view.render()
  },
  scrollMode: false
})

Object.assign(window, { view, interactive })
