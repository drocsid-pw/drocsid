# Funkcjonalności

## Użytkownik (poza gildią)

-   stworzenie
-   usunięcie
-   pobierz informacje o userze
-   stworzenie gildii
-   pobierz listę gildii (per guildId wywoła się od razu getGuildInfo, seryjne wywołanie pierwszego endpointa z guild)

## Gildia

-   pobierz informacje o gildii(bez kanałów)
-   pobierz listę kanałów (per channelId wywoła się od razu getChannelInfo, seryjne wywołanie pierwszego endpointa z channel)
-   usunięcie
-   edycja: nazwa
-   zarządzanie rolami
-   zarządzenie użytkownikiem:
    -   generacja zaproszenia
    -   dodanie po zaproszeniu (wejście na link zaproszenia wysyła request o dodanie z informacją o id użytkownika który kliknął)
    -   wyrzucenie
    -   edycja roli użytkownika
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
-   lista overridów dla poszczególnych ról i ich edycja.
-   usunięcie kanału
-   edycja kanału: nnazwa

Tak wygląda dict overridów:
{
@rola1: {ADMIN_DELETE_MESSAGES; MANAGE_CHANNEL; READ; WRITE},
@rola2: ...
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
    -   READ
    -   WRITE
        flag jest 6, więc robimy z tego 6bitową liczbę

-   Mamy role. Każda rola ma:
    -   nazwa
    -   poziom
    -   maska 6 flag

Rola określa jakie domyślnie osoba z rolą ma uprawnienia. Do tego, każdy kanał może nadpisać per rola uprawnienia dotyczące tego kanału: {ADMIN_DELETE_MESSAGES; MANAGE_CHANNEL; READ; WRITE}.

Domyślnie osoba tworząca serwer dostaje @Owner, który ma 6 flag i poziom 0: {level: 0; name: "@owner"; mask: 111111; }
@owner ma wszystko, jest nienadpisywalny

Domyślnie powstaje #everynone: {level: inf; name: "@everyone"; mask: 000011}
