from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import webbrowser

HOST = "127.0.0.1"
PORT = 8000


class NoCacheHandler(SimpleHTTPRequestHandler):
    # Bom pra desenvolvimento: não “gruda” cache quando você edita CSS/JS
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        super().end_headers()


def main():
    url = f"http://{HOST}:{PORT}/index.html"
    print(f"✅ Servidor rodando em: {url}")
    try:
      webbrowser.open(url)
    except Exception:
      pass

    with ThreadingHTTPServer((HOST, PORT), NoCacheHandler) as httpd:
        httpd.serve_forever()


if __name__ == "__main__":
    main()