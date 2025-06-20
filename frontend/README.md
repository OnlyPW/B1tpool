# B1tpool Frontend

You can build and run the B1tpool frontend and proxy to the production B1tpool backend (for easier frontend development), or you can connect it to your own backend for a full B1tpool development instance, custom deployment, etc.

Jump to a section in this doc:

- [Quick Setup for Frontend Development](#quick-setup-for-frontend-development)
- [Manual Frontend Setup](#manual-setup)
- [Translations](#translations-transifex-project)

## Quick Setup for Frontend Development

If you want to quickly improve the UI, fix typos, or make other updates that don't require any backend changes, you don't need to set up an entire backend—you can simply run the B1tpool frontend locally and proxy to your B1t Core backend.

### 1. Clone B1tpool Repository

Get the latest B1tpool code:

```
git clone https://github.com/OnlyPW/B1tpool
cd litepool
```

### 2. Specify Website

The same frontend codebase is used for https://b1tpool.org and https://explorer.b1tpool.org.

Configure the frontend for the site you want by running the corresponding command:

```
$ npm run config:defaults:mempool
```

### 3. Run the Frontend

_Make sure to use Node.js 16.10 and npm 7._

Install project dependencies and run the frontend server:

```
$ npm install
$ npm run serve:local-prod
```

The frontend will be available at http://localhost:4200/ and all API requests will be proxied to the production server at https://b1tpool.org.

### 4. Test

After making your changes, you can run our end-to-end automation suite and check for possible regressions.

Headless:

```
$ npm run config:defaults:mempool && npm run cypress:run
```

Interactive:

```
$ npm run config:defaults:mempool && npm run cypress:open
```

This will open the Cypress test runner, where you can select any of the test files to run.

If all tests are green, submit your PR, and it will be reviewed by someone on the team as soon as possible.

## Manual Setup

Set up the [B1tpool backend](../backend/) first, if you haven't already.

### 1. Build the Frontend

_Make sure to use Node.js 16.10 and npm 7._

Build the frontend:

```
cd frontend
npm install
npm run build
```

### 2. Run the Frontend

#### Development

To run your local B1tpool frontend with your local B1tpool backend:

```
npm run serve
```

#### Production

The `npm run build` command from step 1 above should have generated a `dist` directory. Put the contents of `dist/` onto your web server.

You will probably want to set up a reverse proxy, TLS, etc. There are sample nginx configuration files in the top level of the repository for reference, but note that support for such tasks is outside the scope of this project.

## Translations: Transifex Project

Litepool merges translations from upstream, so please help through the link below.
https://www.transifex.com/mempool/mempool/dashboard/

### Translators

- Arabic @baro0k
- Czech @pixelmade2
- Danish @pierrevendelboe
- German @Emzy
- English (default)
- Spanish @maxhodler @bisqes
- Persian @techmix
- French @Bayernatoor
- Korean @kcalvinalvinn @sogoagain
- Italian @HodlBits
- Lithuanian @eimze21
- Hebrew @rapidlab309
- Georgian @wyd_idk
- Hungarian @btcdragonlord
- Dutch @m\_\_btc
- Japanese @wiz @japananon
- Norwegian @T82771355
- Polish @maciejsoltysiak
- Portugese @jgcastro1985
- Slovenian @thepkbadger
- Finnish @bio_bitcoin
- Swedish @softsimon\_
- Thai @Gusb3ll
- Turkish @stackmore
- Ukrainian @volbil
- Vietnamese @BitcoinvnNews
- Chinese @wdljt
- Russian @TonyCrusoe @Bitconan
- Romanian @mirceavesa
- Macedonian @SkechBoy
- Nepalese @kebinm
