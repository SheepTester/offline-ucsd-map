/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import { expect } from '../utils/expect.ts'
import { transformation } from '../utils/transformation.ts'
import { MapView } from '../view/index.ts'

const view = new MapView(
  document.getElementById('map') ?? expect('Map wrapper')
)
view.view = transformation({ rotate: Math.PI / 4 })

Object.assign(window, { view, transformation })
