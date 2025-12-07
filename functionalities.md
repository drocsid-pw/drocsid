# Funkcjonalności

## Użytkownik (poza gildią)

-   stworzenie
-   usunięcie
-   stworzenie gildii
-   pobierz listę gildii

## Gildia

-   usunięcie
-   edycja: nazwa
-   zarządzanie rolami
-   zarządzenie użytkownikiem:
    -   dodanie
    -   wyrzucenie
    -   edycja uprawnień
-   zarządzanie kanałem:
    -   stworzenie kanału
-   pobierz listę kanałów

Do tego:

-   utrzymywnie listy memberów:
    -   userId
    -   flags
-   utrzymywanie listy kanałów

Kiedy ładujemy gildię dla użytkownika, najpierw ładują się do niej dane uprawnień, a potem na frontend leci tylko to, co on powinien widzieć

## Kanał

-   default poziom uprawnień dla każdego użytkownika
-   lista overridów dla poszczególnych użytkowników, gdzie podajemy (userId, overridenAccess: ChannelAccessLevel). Ewentualnie (Kuba zweryfikuj) wywalamy to jako odpowiedzialność gildii
-   usunięcie kanału
-   edycja kanału
-   pobierz listę messagów

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
