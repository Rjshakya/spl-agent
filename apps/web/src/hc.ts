


import { hcWithType } from "server/hc"

const client = hcWithType("http://localhost:8000", { init: { credentials: "include" } })
export default client

