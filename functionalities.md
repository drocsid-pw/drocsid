# Funkcjonalności

## Użytkownik (poza gildią)

-   stworzenie
-   usunięcie

## Gildia

-   stworzenie
-   usunięcie
-   edycja: nazwa
-   zarządzenie użytkownikiem:
    -   dodanie
    -   wyrzucenie
    -   edycja uprawnień
-   zarządzanie kanałem:
    -   stworzenie kanału
    -   usunięcie kanału
    -   edycja kanału

Do tego:

-   utrzymywnie listy memberów:
    -   userId
    -   flags
-   utrzymywanie listy kanałów

Kiedy ładujemy gildię dla użytkownika, najpierw ładują się do niej dane uprawnień, a potem na frontend leci tylko to, co on powinien widzieć

## Kanał

-   Mamy type ChannelAccessLevel = 0 | 1 | 2, czyli HIDDEN, READ, WRITE

-   default poziom uprawnień dla każdego użytkownika
-   lista overridów dla poszczególnych użytkowników, gdzie podajemy (userId, overridenAccess: ChannelAccessLevel). Ewentualnie (Kuba zweryfikuj) wywalamy to jako odpowiedzialność gildii

## Message

-   stworzenie
-   usunięcie

# Uprawnienia w gildiach

-   trzymamy flagi per użytkownik:
    -   MANAGE_GUILD_USERS, może robić wszystko z użytkownikami
    -   MANAGE_CHANNELS, może robić wszystko z kanałami, w tym dodawać te overridy
    -   ADMIN_DELETE_MESSAGES, może usuwać wiadomości
    -   MANAGE_GUILD, może edytować gildię (zmieniać nazwę, zmieniać wartości tych flag per user)
        flagi są 4, więc robimy z tego 4bitową liczbę
        Ewentualnie (Kuba zweryfikuj) dodajemy OWNER, który jest odporny na zmiany
