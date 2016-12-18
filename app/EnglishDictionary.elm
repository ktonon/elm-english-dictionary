module EnglishDictionary
    exposing
        ( checkIsWord
        , fetchDefinitions
        , Definition
        , Error
        , Config
        )

{-| English language dictionary. Check word membership and lookup definitions.

@docs checkIsWord, fetchDefinitions, Definition, Error, Config
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


{-| A word defition consists of a part of speech (ex, noun) a meaning, and zero
or more short examples.
-}
type alias Definition =
    { partOfSpeech : PartOfSpeech
    , meaning : String
    , examples : List String
    }


definitionDecoder : Decoder (List Definition)
definitionDecoder =
    Decode.list
        (Decode.map3 Definition
            (at [ "partsOfSpeech" ] PartOfSpeech.decoder)
            (at [ "meaning" ] Decode.string)
            (at [ "examples" ] (Decode.list Decode.string))
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
checkIsWord : Config -> String -> Task Error Bool
checkIsWord config word =
    if String.length word <= 5 then
        Words1To5.words
            |> Set.member word
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
fetchDefinitions : Config -> String -> Task Error (List Definition)
fetchDefinitions config word =
    ensureEndpoint config
        (\endpoint ->
            definitionsRequest endpoint word
                |> Http.toTask
                |> Task.mapError HttpError
        )



-- HTTP


checkRequest : String -> String -> Http.Request Bool
checkRequest endpoint word =
    Http.get (endpoint ++ "/check/" ++ word) Decode.bool


definitionsRequest : String -> String -> Http.Request (List Definition)
definitionsRequest endpoint word =
    Http.get (endpoint ++ "/define/" ++ word) definitionDecoder
