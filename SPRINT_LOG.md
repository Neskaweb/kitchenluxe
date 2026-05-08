# SPRINT_LOG

Derniere mise a jour : 2026-05-09

## Ce qui a ete fait

- Re-cadrage projet : KitchenLuxe est separe de Prodfunnel, avec son propre canal Pinterest, ses donnees et ses workflows.
- Remplacement des instructions projet erronees par `AGENTS.md`, `CLAUDE.md` et `KITCHENLUXE_BRIEFING.md` dedies a KitchenLuxe.
- Retrait de `PRODFUNNEL_BRIEFING.md` du repo KitchenLuxe pour eviter les melanges de contexte.
- Ajout d'un autopilote V1 JSON-first adapte au repo existant : ingestion RSS, signaux Instagram manuels, backlog produit, dedoublonnage, queue, review qualite, revision, promotion, logs et status.
- Ajout du dashboard `/admin/autopilot`, des routes admin protegees, de l'export Instagram manuel et du tracking page/clic avec attribution source/canal/UTM/session.
- Remplacement des secrets hardcodes Pinterest/Make par des variables d'environnement et mode manuel/export si webhook absent.
- Ajout workflow GitHub Actions quotidien, scripts npm `autopilot`, `validate-autopilot`, `run-autopilot-local`, summary et validation RSS.
- Validation locale 2026-04-26 : `npm run build` OK, `npm run lint` OK avec 27 warnings, `npm run validate-autopilot` OK avec 81 produits, 78 posts, 250 items RSS.
- Diagnostic Pinterest 2026-04-26 : les pins visibles sur Pinterest correspondent au flux public `/feed.xml`. Le flux exposait jusqu'a 50 posts x 5 images `pinterestImages`, avec titres variantes `(Astuce #2-#5)` et `media:content`; Pinterest semble aspirer ce RSS automatiquement. La route `/api/pinterest/publish`/Make ne semble pas etre le chemin utilise.
- Hotfix prod 2026-04-26 : `/feed.xml` limite maintenant Pinterest/RSS a 1 item par article. Verification live OK : 50 items RSS, 0 variante `Astuce #`.
- 2026-05-08 : Neska confirme que l'application API Pinterest KitchenLuxe est approuvee.
- Verification locale 2026-05-08 : `npm run validate-autopilot` OK avec 81 produits, 78 posts, 0 queue, 0 social drafts, 250 items RSS ; `npm run lint` OK avec 25 warnings ; `npm run build` OK.
- 2026-05-08 : durcissement qualite Pinterest avant publication reelle. Les pins produits utilisent maintenant une image verticale generee KitchenLuxe, un `altText`, un score qualite, des descriptions non promotionnelles et un blocage automatique si le seuil qualite n'est pas atteint. Le dashboard Pinterest affiche le score et bloque les boutons de publication si le pin est a revoir.
- Verification Pinterest qualite 2026-05-08 : export runtime OK avec 3 premiers pins a 100/100 ; `/api/pinterest/pin-image/kitchenaid-artisan` retourne un PNG valide ; capture Playwright du dashboard OK avec apercu charge.
- 2026-05-08 : connecteur API Pinterest officiel ajoute en dry-run par defaut. `POST /api/pinterest/publish` prepare maintenant le payload `POST /v5/pins` avec `board_id`, `title`, `description`, `alt_text`, `link` et `media_source.image_url`. Aucun appel live ne part sans `mode=live&confirm=publish` et `PINTEREST_API_DRY_RUN=0`.
- Verification API Pinterest 2026-05-08 : dry-run batch OK sur 5 pins a 100/100 ; garde-fou live OK meme avec `mode=live&confirm=publish` car `PINTEREST_API_DRY_RUN` reste actif ; dashboard capture OK avec libelles API Pinterest / dry-run.
- 2026-05-09 : ajout des routes OAuth Pinterest `/api/pinterest/oauth/start` et `/api/pinterest/oauth/callback`. La redirect URI retenue est `https://kitchenluxe.vercel.app/api/pinterest/oauth/callback`. Build OK, routes detectees par Next.
- 2026-05-09 : Neska a ajoute la redirect URI officielle dans l'application Pinterest : `https://kitchenluxe.vercel.app/api/pinterest/oauth/callback`. `.env.local` existe maintenant, mais les variables OAuth `PINTEREST_CLIENT_ID`, `PINTEREST_CLIENT_SECRET` et `PINTEREST_REDIRECT_URI` restent a renseigner avant l'echange automatique du code.
- 2026-05-09 : apres redeploiement Vercel signale par Neska, verification live : `/api/pinterest/oauth/start` et `/api/pinterest/oauth/callback` repondent encore en 404. Les fichiers OAuth sont presents localement mais non suivis Git, donc ils ne semblent pas encore inclus dans le deploiement Vercel.
- 2026-05-09 : preparation du commit Pinterest API/OAuth uniquement. Verification secrets sur le diff staged OK, `npm run lint` OK avec 25 warnings historiques, `npm run build` OK et routes OAuth detectees dans le build Next.
- 2026-05-09 : push effectue sur `origin/main` via le commit `e03f082`. Verification live apres deploiement : `/api/pinterest/oauth/callback` repond `400 Missing Pinterest authorization code` et `/api/pinterest/oauth/start` repond `401 Unauthorized`, ce qui confirme que les routes sont bien en production et que la route de depart est protegee par `KITCHENLUXE_API_KEY`.

## Ce qui reste du sprint courant

- Nettoyer progressivement les slugs historiques dupliques dans `src/data/posts.json` sans casser les URLs deja indexees.
- Corriger les warnings lint faciles : imports inutilises, `img` sans `alt`, directives eslint devenues inutiles.
- Observer si les sources RSS restent stables en GitHub Actions, puis ajuster `src/data/source-feeds.json` si necessaire.
- Brancher Gemini optionnel pour enrichir les drafts au-dessus du generateur deterministe, tout en gardant le fallback sans cle API.
- Configurer les secrets Pinterest officiels en environnement, puis tester contre le vrai board en dry-run avant toute publication reelle.
- Garder la V1 JSON tant qu'aucune decision explicite de migration KitchenLuxe n'est prise.

## Blockers / questions en attente de Neska

- Configurer `KITCHENLUXE_API_KEY` en production pour proteger `/admin` et les routes admin.
- Configurer `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_AMAZON_TAG_FR`, `AUTOPILOT_DAILY_LIMIT` et les variables Pinterest approuvees, uniquement via environnement : `PINTEREST_ACCESS_TOKEN`, `PINTEREST_BOARD_ID`, optionnellement `PINTEREST_BOARD_SECTION_ID`.
- Configurer `PINTEREST_CLIENT_ID`, `PINTEREST_CLIENT_SECRET` et `PINTEREST_REDIRECT_URI` pour echanger automatiquement le code OAuth, ou echanger le code manuellement si Neska prefere.
- `.env.local` est present dans ce workspace, mais il manque encore les variables OAuth client/secret/redirect. Les valeurs exactes doivent rester privees et ne pas etre collees dans le chat.
- Confirmer le niveau d'acces Pinterest obtenu (Trial ou Standard) et la strategie technique : API Pinterest directe ou maintien Make/webhook.
- Faire valider visuellement 3 a 5 pins exemples par Neska avant activation d'un envoi reel.
- Confirmer quand passer le workflow quotidien de mode prudent/export a publication reelle.

## Prochaine action a executer

- Renseigner `PINTEREST_ACCESS_TOKEN` et `PINTEREST_BOARD_ID` en local/prod, garder `PINTEREST_API_DRY_RUN=1`, puis refaire `POST /api/pinterest/publish?batch=5` pour verifier le vrai board sans publier.
- Ajouter `PINTEREST_CLIENT_ID`, `PINTEREST_CLIENT_SECRET` et `PINTEREST_REDIRECT_URI` en local/prod, ouvrir le lien OAuth Pinterest avec les scopes `boards:read,boards:write,pins:read,pins:write`, recuperer un vrai access token OAuth, puis lister les boards pour remplacer l'ID application par le vrai `PINTEREST_BOARD_ID`.
- Ouvrir le lien OAuth Pinterest, recuperer le vrai token utilisateur, lister les boards, puis remplacer l'ID application par le vrai `PINTEREST_BOARD_ID`.
- Nettoyer les slugs dupliques dans `src/data/posts.json`, puis relancer `npm run validate-autopilot`, `npm run lint` et `npm run build`.
- Continuer a surveiller Pinterest dans les prochaines 24h : le flux ne publie plus les variantes, mais Pinterest peut garder les anciens pins deja ingeres.
