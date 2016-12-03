module EnglishDictionary exposing (..)

import Set
import Task exposing (Task)
import Words3To5


checkIsWord : String -> Task String Bool
checkIsWord lemma =
    if String.length lemma <= 5 then
        Words3To5.words
            |> Set.member lemma
            |> Task.succeed
    else
        Task.fail "Unable to lookup word membership"


fetchDefinition : String -> Task String String
fetchDefinition lemma =
    Task.fail "Unable to lookup word definition"
