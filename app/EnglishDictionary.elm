module EnglishDictionary
    exposing
        ( checkIsWord
        , fetchDefinitions
        , Definition
        , Error
        , Config
        , WordCheck
        , WordDefinition
        )

{-| English language dictionary. Check word membership and lookup definitions.

@docs checkIsWord, fetchDefinitions, Definition, Error, Config, WordDefinition, WordCheck
-}

import Http
import Json.Decode as Decode exposing (at, Decoder)
import PartOfSpeech exposing (PartOfSpeech)
import Set
import Task exposing (Task)
import Words1To5


-- MODEL


{-| Holds the endpoint of the companion serverless API. To reduce the size of
the Elm package, all of the word definitions are stored in an AWS Lambda
(serverless) API.
-}
type alias Config =
    { endpoint : String
    }


{-| A word with a list of definitions.
-}
type alias WordDefinition =
    { word : String
    , definitions : List Definition
    }


{-| Whether or not a word is part of the english language.
-}
type alias WordCheck =
    { word : String
    , exists : Bool
    }


{-| A word defition consists of a part of speech (ex, noun) a meaning, and zero
or more short examples.
-}
type alias Definition =
    { partOfSpeech : PartOfSpeech
    , meaning : String
    , examples : List String
    }


checkDecoder : String -> Decoder WordCheck
checkDecoder word =
    Decode.map2 WordCheck
        (Decode.succeed word)
        (Decode.bool)


definitionDecoder : String -> Decoder WordDefinition
definitionDecoder word =
    Decode.map2 WordDefinition
        (Decode.succeed word)
        (Decode.list
            (Decode.map3 Definition
                (at [ "partsOfSpeech" ] PartOfSpeech.decoder)
                (at [ "meaning" ] Decode.string)
                (at [ "examples" ] (Decode.list Decode.string))
            )
        )


{-| Errors can either be Http or misconfiguration (i.e. missing endpoint)
-}
type Error
    = HttpError Http.Error
    | MissingEndpoint



-- API


ensureEndpoint : Config -> (String -> Task Error x) -> Task Error x
ensureEndpoint config makeTask =
    if String.isEmpty config.endpoint then
        Task.fail MissingEndpoint
    else
        makeTask config.endpoint


{-| Check membership of a word in the English language.

Words up to and including length 5 can be checked without making an Http request
to the backing serverless API.
-}
checkIsWord : Config -> String -> Task Error WordCheck
checkIsWord config word =
    if String.length word <= 5 then
        Words1To5.words
            |> Set.member word
            |> WordCheck word
            |> Task.succeed
    else
        ensureEndpoint config
            (\endpoint ->
                checkRequest endpoint word
                    |> Http.toTask
                    |> Task.mapError HttpError
            )


{-| Fetch a list of definitions associated with the given word.
-}
fetchDefinitions : Config -> String -> Task Error WordDefinition
fetchDefinitions config word =
    ensureEndpoint config
        (\endpoint ->
            definitionsRequest endpoint word
                |> Http.toTask
                |> Task.mapError HttpError
        )



-- HTTP


checkRequest : String -> String -> Http.Request WordCheck
checkRequest endpoint word =
    Http.get (endpoint ++ "/check/" ++ word) (checkDecoder word)


definitionsRequest : String -> String -> Http.Request WordDefinition
definitionsRequest endpoint word =
    Http.get (endpoint ++ "/define/" ++ word) (definitionDecoder word)
