# appleJuiceNET Discord Bot

Einfacher Discord Bot für Netzwerk Statistiken

[![](https://img.shields.io/discord/748168568230641666)](https://discord.gg/qUMDHV)
![](https://github.com/applejuicenet/discord-bot/workflows/container/badge.svg)
![](https://img.shields.io/github/license/applejuicenet/discord-bot.svg)

### Commands
- `!help` listet die möglichen Commands
- `!ping` einfacher test, ob der Bot läuft
- `!stats` liefert aktuelle Zahlen des Netzwerks
- `!server` gibt die Anzahl der aktiven Server aus
- `!serverlist` gibt eine Ascii Tabelle der Serverliste aus
- `!aj` ermöglicht es dir, deine aktuellen AJ Statistiken im Discord zu posten

## !aj Command

Du benötigt zusätzlich unseren [core-information-collector](https://github.com/applejuicenet/core-information-collector) auf einem deiner Geräte.

Dieses Programm ist eine kleine Java Anwendung, welche regelmäßig deine Core Statistiken (Credits, Upload, Download) an diesen Discord Bot schickt.

Die Daten werden über ein individuelles Authorization Token an deine Discord UserID verknüpft. Es werden keine weiteren Daten, wie bspw. deine IP Adresse gespeichert.

Dein persönliches `Authorization Token` bekommst du vom Bot direkt im Discord als private Nachricht, sobald du das erste Mal `!aj` eingibst und noch kein Token vorhanden ist.

Solltest du dein Token verloren haben, kannst du deine Daten via `!aj reset` zurücksetzen lassen.
