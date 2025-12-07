# Funkcjonalności

## Użytkownik (poza gildią)

-   stworzenie
-   usunięcie
-   pobierz informacje o userze
-   stworzenie gildii
-   pobierz listę gildii (per guildId wywoła się od razu getGuildInfo)

## Gildia

-   pobierz informacje o gildii(bez kanałów)
-   pobierz listę kanałów (per channelId wywoła się od razu getChannelInfo)
-   usunięcie
-   edycja: nazwa
-   zarządzanie rolami
-   zarządzenie użytkownikiem:
    -   generacja zaproszenia
    -   dodanie
    -   wyrzucenie
    -   edycja uprawnień
-   zarządzanie kanałem:
    -   stworzenie kanału

Do tego:

-   utrzymywnie listy memberów:
    -   userId
    -   flags
-   utrzymywanie listy kanałów

Kiedy ładujemy gildię dla użytkownika, najpierw ładują się do niej dane uprawnień, a potem na frontend leci tylko to, co on powinien widzieć

## Kanał

-   pobierz informacje o kanale (bez messagów)
-   pobierz listę messagów
-   default poziom uprawnień dla każdego użytkownika
-   lista overridów dla poszczególnych użytkowników, gdzie podajemy (userId, overridenAccess: ChannelAccessLevel).
-   usunięcie kanału
-   edycja kanału

{
rola1: {ADMIN_DELETE_MESSAGES; MANAGE_CHANNEL; READ; WRITE}
rola2: ...
...
}

## Message

-   stworzenie
-   usunięcie

# Uprawnienia w gildiach

-   trzymamy flagi per rola:

    -   MANAGE_GUILD_USERS, może robić wszystko z użytkownikami
    -   MANAGE_CHANNEL, może robić wszystko z kanałami, w tym zmieniać overridy r/w
    -   ADMIN_DELETE_MESSAGES, może usuwać wiadomości
    -   MANAGE_GUILD, może edytować gildię (zmieniać nazwę, zmieniać wartości tych flag per user)
        flagi są 4, więc robimy z tego 4bitową liczbę
    -   READ
    -   WRITE

-   Mamy role. Każda rola ma:
    -   poziom
    -   maska flag
    -   nazwa

Rola określa jakie domyślnie osoba z rolą ma uprawnienia. Do tego, każdy kanał może nadpisać per rola uprawnienia dotyczące tego kanału: {ADMIN_DELETE_MESSAGES; MANAGE_CHANNEL; READ; WRITE}.

Domyślnie osoba tworząca serwer dostaje @Owner, który ma 4 flagi i poziom 0: {level: 0; name: "@owner"; mask: 1111; }
@owner ma wszystko, jest nienadpisywalny

Domyślnie powstaje #everynone: {level: inf; name: "@everyone"; mask: 0000}
