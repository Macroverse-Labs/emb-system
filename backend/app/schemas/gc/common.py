"""Shared response shapes for the GC console API."""

from pydantic import BaseModel


class ActionResult(BaseModel):
    """What a mutation reports back.

    `message` is the sentence the console shows in its toast, so it is written by the
    server: the design's toasts describe what actually happened ("… — contractors
    notified"), and only the server knows that.
    """

    ok: bool = True
    message: str
