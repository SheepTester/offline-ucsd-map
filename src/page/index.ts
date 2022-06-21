/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import { expect } from '../utils/expect.ts'
import { MapView } from '../view/index.ts'

const view = new MapView(
  document.getElementById('map') ?? expect('Map wrapper')
)
