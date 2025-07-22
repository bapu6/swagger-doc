window.onload = function() {
  //<editor-fold desc="Changeable Configuration Block">

  const snippetTargets = [
    { title: 'Python (requests)', target: 'python_requests' },
    { title: 'cURL', target: 'shell_curl' },               // explicit cURL
    { title: 'JavaScript (XHR)', target: 'javascript_xhr' },
    { title: 'JavaScript (jQuery)', target: 'javascript_jquery' },
    { title: 'Javascript (fetch)', target: 'javascript_fetch' },
    { title: 'Java (OkHttp)', target: 'java_okhttp' },
    { title: 'Java (Unirest)', target: 'java_unirest' },
    { title: 'Go (native)', target: 'go_native' },
    // Add more languages here...
  ];

  // the following lines will be replaced by docker/configurator, when it runs in a docker-container
  window.ui = SwaggerUIBundle({
    url:"https://bapu6.github.io/swagger-doc/swagger.json",
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl,
      SwaggerSnippetGenerator(snippetTargets)
    ],
    requestSnippetsEnabled: true,
    layout: "StandaloneLayout"
  });

  //</editor-fold>
};
