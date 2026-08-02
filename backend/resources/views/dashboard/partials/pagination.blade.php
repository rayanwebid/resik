@if ($paginator->hasPages())
<div class="pagination">
    {{-- Previous --}}
    @if ($paginator->onFirstPage())
        <span class="disabled"><i class="fas fa-chevron-left"></i></span>
    @else
        <a href="{{ $paginator->previousPageUrl() }}"><i class="fas fa-chevron-left"></i></a>
    @endif

    {{-- Pages --}}
    @foreach ($elements as $element)
        @if (is_string($element))
            <span class="disabled">{{ $element }}</span>
        @endif
        @if (is_array($element))
            @foreach ($element as $page => $url)
                @if ($page == $paginator->currentPage())
                    <span class="active">{{ $page }}</span>
                @else
                    <a href="{{ $url }}">{{ $page }}</a>
                @endif
            @endforeach
        @endif
    @endforeach

    {{-- Next --}}
    @if ($paginator->hasMorePages())
        <a href="{{ $paginator->nextPageUrl() }}"><i class="fas fa-chevron-right"></i></a>
    @else
        <span class="disabled"><i class="fas fa-chevron-right"></i></span>
    @endif
</div>
@endif
