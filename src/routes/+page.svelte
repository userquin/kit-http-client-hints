<script lang="ts">
    /** @type {{ data: import('./$types').PageData }} */
    let { data } = $props()
</script>

<details>
    <summary>HTTP Client Hints Options</summary>
    <pre>{JSON.stringify(data.httpClientHintsOptions ?? {}, null, 2)}</pre>
</details>
<details>
    <summary>HTTP Client Hints Headers</summary>
    <pre>{JSON.stringify(data.httpClientHints ?? {}, null, 2)}</pre>
</details>

<img src="/mountains_1.jpg" sizes="22vw" alt="a mountain">
